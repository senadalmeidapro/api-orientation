import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetRecommendationsDto } from './dto/get-recommendations.dto';
import { ResultsService } from '../results/results.service';
import { Assessment, AssessmentResult, Career, RiasecType, TestStatus } from '@prisma/client';
import { CacheService } from '@common/cache/cache.service';

type CareerWithInstitutions = Career & {
  institutions: Array<{
    formation: {
      university: {
        id: number;
        name: string;
        latitude: number | null;
        longitude: number | null;
        city: string | null;
        address: string | null;
        website: string;
      } | null;
      id: number;
      title: string;
      degree: string;
      duration: string;
      field: string | null;
      costMin: number | null;
      costMax: number | null;
      universityId: number | null;
    } | null;
    isPrimary: boolean;
  }>;
};

type FormationRecommendation = {
  formation: {
    id: number;
    name: string;
    title: string;
    degree: string;
    duration: string;
    field: string | null;
    costMin: number | null;
    costMax: number | null;
    universityId: number;
  };
  university: {
    id: number;
    name: string;
    latitude: number | null;
    longitude: number | null;
    city: string | null;
    address: string | null;
    website: string;
  };
  score: number;
  scholarships: Array<{
    id: number;
    code: string | null;
    title: string;
    provider: string;
    amountLabel: string | null;
    applicationUrl: string | null;
    applicationCloseAt: Date | null;
    fundingType: string | null;
    status: string;
    matchReason: string[];
  }>;
};

type CareerRecommendationOutput = {
  id: string;
  resultId: string;
  careerId: number;
  matchScore: number;
  rankPosition: number;
  viewedAt: Date | null;
  savedForLater: boolean;
  createdAt: Date;
  career: Career | null;
};

type UniversityRecommendationOutput = {
  id: string;
  resultId: string;
  universityId: number;
  matchScore: number;
  rankPosition: number;
  viewedAt: Date | null;
  savedForLater: boolean;
  createdAt: Date;
  university: {
    id: number;
    name: string;
    latitude: number | null;
    longitude: number | null;
    city: string | null;
    address: string | null;
    website: string;
  } | null;
};

type RankedCareer = {
  career: Career | CareerWithInstitutions;
  score: number;
};

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly resultsService: ResultsService,
    private readonly cache: CacheService,
  ) {}

  // =====================================================
  // HELPERS GÉNÉRIQUES
  // =====================================================

  private buildWeights(specificCode: string) {
    const letters = specificCode.split('') as RiasecType[];
    const weights: Record<string, number> = {};
    if (letters[0]) weights[letters[0]] = 50;
    if (letters[1]) weights[letters[1]] = 30;
    if (letters[2]) weights[letters[2]] = 20;
    return weights;
  }

  private hasInstitutions(
    career: Career | CareerWithInstitutions,
  ): career is CareerWithInstitutions {
    return 'institutions' in career;
  }

  private getInstitutions(career: Career | CareerWithInstitutions) {
    return this.hasInstitutions(career) ? career.institutions : [];
  }

  private getProximityBonus(
    user: { lat: number; lon: number },
    target: { lat: number | null; lon: number | null },
    radiusKm: number,
  ) {
    if (target.lat === null || target.lon === null) return 0;
    const distance = this.distanceKm(user, { lat: target.lat, lon: target.lon });
    if (distance > radiusKm) return 0;
    const ratio = 1 - distance / radiusKm;
    return Math.round(Math.max(0, Math.min(1, ratio)) * 10);
  }

  private normalizeVector(raw?: Record<string, number> | null) {
    const keys: RiasecType[] = ['R', 'I', 'A', 'S', 'E', 'C'];
    const vector = keys.map((key) => Number(raw?.[key] ?? 0));
    const max = Math.max(...vector, 0);
    if (max === 0) return vector;
    return vector.map((v) => Math.round((v / max) * 100));
  }

  private cosineSimilarity(a: number[], b: number[]) {
    if (a.length !== b.length || a.length === 0) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i += 1) {
      const aValue = a[i] ?? 0;
      const bValue = b[i] ?? 0;
      dot += aValue * bValue;
      normA += aValue * aValue;
      normB += bValue * bValue;
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / Math.sqrt(normA * normB);
  }

  private distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const r = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
    return 2 * r * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  private toNumberRecord(value: unknown): Record<string, number> | null {
    if (!this.isRecord(value)) return null;
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(value)) {
      if (typeof v === 'number') out[k] = v;
    }
    return out;
  }

  private extractNormalizedScores(result: { scoresByCategory?: unknown }) {
    const scoresByCategory = result.scoresByCategory;
    if (this.isRecord(scoresByCategory)) {
      const totalNormalized = scoresByCategory.totalNormalized;
      const asNumbers = this.toNumberRecord(totalNormalized);
      if (asNumbers) return this.normalizeVector(asNumbers);

      const totalRaw = this.toNumberRecord(scoresByCategory.totalRaw);
      if (totalRaw) return this.normalizeVector(totalRaw);

      const generale = this.toNumberRecord(scoresByCategory.GENERALE);
      if (generale) return this.normalizeVector(generale);
    }

    return [0, 0, 0, 0, 0, 0];
  }

  private normalizeText(value: string | null | undefined): string {
    return (value ?? '').trim().toLowerCase();
  }

  private levelMatches(formationDegree: string, scholarshipLevel: string | null): boolean {
    const degree = this.normalizeText(formationDegree);
    const level = this.normalizeText(scholarshipLevel);
    if (!level) return false;

    const has = (text: string, tokens: string[]) => tokens.some((token) => text.includes(token));
    const degreeToTokens: Record<string, string[]> = {
      licence: ['licence', 'license', 'bachelor', 'undergraduate'],
      master: ['master', 'msc', 'ma', 'ingénieur'],
      doctorat: ['doctorat', 'phd', 'doctorate'],
      bts: ['bts', 'technicien', 'bt'],
      dut: ['dut', 'technicien'],
    };

    for (const [key, tokens] of Object.entries(degreeToTokens)) {
      if (degree.includes(key) && has(level, tokens)) return true;
    }
    return has(level, [degree]);
  }

  private fieldMatches(formationField: string | null, scholarshipField: string | null): boolean {
    const formation = this.normalizeText(formationField);
    const scholarship = this.normalizeText(scholarshipField);
    if (!formation || !scholarship) return false;
    return formation.includes(scholarship) || scholarship.includes(formation);
  }

  // =====================================================
  // RÉSOLUTION SESSION / ASSESSMENT / RESULT (partagée)
  // =====================================================

  private async resolveAssessmentResult(
    dto: GetRecommendationsDto,
    sessionToken: string,
  ): Promise<{ assessment: Assessment; result: AssessmentResult }> {
    const session = await this.prisma.session.findFirst({
      where: {
        sessionToken,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      select: { id: true },
    });
    if (!session) {
      throw new NotFoundException('Aucune recommandation disponible pour cette session');
    }

    const assessment = dto.assessmentId
      ? await this.prisma.assessment.findFirst({
          where: { id: dto.assessmentId, sessionId: session.id },
        })
      : await this.prisma.assessment.findFirst({
          where: { sessionId: session.id, status: TestStatus.COMPLETED },
          orderBy: { completedAt: 'desc' },
        });

    if (!assessment) {
      throw new NotFoundException('Aucune recommandation disponible pour cette session');
    }

    let result = await this.prisma.assessmentResult.findUnique({
      where: { assessmentId: assessment.id },
    });

    if (!result) {
      result = await this.resultsService.compute({
        sessionToken,
        assessmentId: assessment.id,
      });
    }

    return { assessment, result };
  }

  // =====================================================
  // BOURSES (chargement à la demande, jamais persisté)
  // =====================================================

  private async loadScholarshipsForFormations(
    formations: Array<{
      id: number;
      degree: string;
      field: string | null;
      universityId: number;
    }>,
  ) {
    if (formations.length === 0) {
      return new Map<number, FormationRecommendation['scholarships']>();
    }

    const now = new Date();
    const universityIds = Array.from(new Set(formations.map((f) => f.universityId)));

    const scholarships = await this.prisma.scholarship.findMany({
      where: {
        isActive: true,
        status: 'PUBLISHED',
        AND: [
          {
            OR: [
              {
                universities: {
                  some: {
                    universityId: {
                      in: universityIds,
                    },
                  },
                },
              },
              {
                universities: {
                  none: {},
                },
              },
            ],
          },
          {
            OR: [{ applicationCloseAt: null }, { applicationCloseAt: { gte: now } }],
          },
        ],
      },
      include: {
        universities: true,
      },
      orderBy: [{ applicationCloseAt: 'asc' }, { createdAt: 'desc' }],
      take: 300,
    });

    const byFormation = new Map<number, FormationRecommendation['scholarships']>();

    for (const formation of formations) {
      const candidates = scholarships
        .filter((s) => {
          const linkedUniversityIds = s.universities.map((u) => u.universityId);

          return (
            linkedUniversityIds.length === 0 || linkedUniversityIds.includes(formation.universityId)
          );
        })
        .map((scholarship) => {
          const reasons: string[] = [];

          const sameUniversity = scholarship.universities.some(
            (u) => u.universityId === formation.universityId,
          );

          if (sameUniversity) {
            reasons.push('Liée à la même université');
          } else {
            reasons.push('Bourse ouverte (non liée à une université spécifique)');
          }

          if (this.levelMatches(formation.degree, scholarship.level)) {
            reasons.push('Niveau compatible');
          }

          if (this.fieldMatches(formation.field, scholarship.field)) {
            reasons.push('Domaine compatible');
          }

          const levelBoost = this.levelMatches(formation.degree, scholarship.level) ? 15 : 0;

          const fieldBoost = this.fieldMatches(formation.field, scholarship.field) ? 15 : 0;

          const universityBoost = sameUniversity ? 20 : 0;

          const closeBoost =
            scholarship.applicationCloseAt && scholarship.applicationCloseAt > now ? 5 : 0;

          const rank = universityBoost + levelBoost + fieldBoost + closeBoost;

          return {
            rank,
            item: {
              id: scholarship.id,
              code: scholarship.code,
              title: scholarship.title,
              provider: scholarship.provider,
              amountLabel: scholarship.amountLabel,
              applicationUrl: scholarship.applicationUrl,
              applicationCloseAt: scholarship.applicationCloseAt,
              fundingType: scholarship.fundingType,
              status: scholarship.status,
              matchReason: reasons,
            },
          };
        })
        .sort((a, b) => b.rank - a.rank)
        .slice(0, 5)
        .map((entry) => entry.item);

      byFormation.set(formation.id, candidates);
    }

    return byFormation;
  }

  // =====================================================
  // CARRIÈRES
  // =====================================================

  private async buildCareerRecommendations(
    dto: GetRecommendationsDto,
    sessionToken: string,
  ): Promise<CareerRecommendationOutput[]> {
    const { assessment, result } = await this.resolveAssessmentResult(dto, sessionToken);

    const hasGeo = dto.latitude !== undefined && dto.longitude !== undefined;
    const isCanonicalMode = !hasGeo && !dto.category && !dto.advanced;

    if (!dto.force && isCanonicalMode) {
      const cached = await this.prisma.assessmentCareerRecommendation.findMany({
        where: { resultId: result.id },
        include: { career: true },
        orderBy: { rankPosition: 'asc' },
        take: dto.limit ?? 6,
      });
      if (cached.length > 0) return cached;
    }

    type CareerLike = Career | CareerWithInstitutions;

    let careers: CareerLike[] | null = null;
    if (!hasGeo) {
      const cacheKey = `careers:active:${dto.category ?? 'all'}`;
      careers = await this.cache.get<Career[]>(cacheKey);
      if (!careers) {
        careers = await this.prisma.career.findMany({
          where: {
            isActive: true,
            ...(dto.category ? { category: dto.category } : {}),
          },
        });
        await this.cache.set(cacheKey, careers, 300);
      }
    }
    if (!careers) {
      careers = await this.prisma.career.findMany({
        where: {
          isActive: true,
          ...(dto.category ? { category: dto.category } : {}),
        },
        include: {
          institutions: {
            include: {
              formation: {
                include: {
                  university: {
                    select: { latitude: true, longitude: true },
                  },
                },
              },
            },
          },
        },
      });
    }

    const baseCode = result.riasecCode;
    if (!baseCode) return [];

    const weights = this.buildWeights(baseCode);
    const maxWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    if (maxWeight === 0) return [];

    const scored = careers
      .map((career) => {
        const codes = career.riasecCodes ?? [];
        let sum = 0;
        for (const code of codes) {
          const w = weights[code] ?? 0;
          if (w > 0) sum += w;
        }
        if (sum === 0) return { career, score: 0 };
        const baseScore = Math.round((sum / maxWeight) * 100);
        const demandBoost = career.localDemand ? career.localDemand * 2 : 0;
        let score = Math.min(100, baseScore + demandBoost);
        if (hasGeo && dto.latitude !== undefined && dto.longitude !== undefined) {
          const radiusKm = dto.radiusKm ?? 50;
          const institutions = this.getInstitutions(career);
          let minDistance: number | null = null;
          for (const link of institutions) {
            const university = link.formation?.university;
            const lat = university?.latitude;
            const lon = university?.longitude;
            if (lat === null || lat === undefined || lon === null || lon === undefined) continue;
            const distance = this.distanceKm(
              { lat: dto.latitude, lon: dto.longitude },
              { lat, lon },
            );
            if (minDistance === null || distance < minDistance) {
              minDistance = distance;
            }
          }
          if (minDistance !== null && minDistance <= radiusKm) {
            score = Math.min(100, score + 10);
          }
        }
        return { career, score };
      })
      .filter((c) => c.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const demandA = a.career.localDemand ?? 0;
        const demandB = b.career.localDemand ?? 0;
        if (demandB !== demandA) return demandB - demandA;
        return a.career.name.localeCompare(b.career.name);
      });

    let blended: RankedCareer[] = scored;
    if (dto.advanced) {
      const currentVector = this.extractNormalizedScores(result);
      const contextLookback = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
      const recentResults = await this.prisma.assessmentResult.findMany({
        where: {
          assessmentId: { not: assessment.id },
          createdAt: { gte: contextLookback },
          assessment: {
            status: TestStatus.COMPLETED,
            type: assessment.type,
            testVersionId: assessment.testVersionId,
            ...(assessment.currentCategory ? { currentCategory: assessment.currentCategory } : {}),
          },
        },
        select: { id: true, scoresByCategory: true },
        orderBy: { createdAt: 'desc' },
        take: 200,
      });

      const similarities = recentResults
        .map((item) => {
          const vector = this.extractNormalizedScores(item);
          return {
            id: item.id,
            similarity: this.cosineSimilarity(currentVector, vector),
          };
        })
        .filter((item) => item.similarity >= 0.6)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 30);

      const similarityMap = new Map(similarities.map((item) => [item.id, item.similarity]));
      if (similarityMap.size > 0) {
        const cfRecs = await this.prisma.assessmentCareerRecommendation.findMany({
          where: { resultId: { in: Array.from(similarityMap.keys()) } },
          select: { resultId: true, careerId: true, matchScore: true },
        });

        const aggregates = new Map<number, number>();
        for (const rec of cfRecs) {
          const weight = similarityMap.get(rec.resultId) ?? 0;
          if (weight === 0) continue;
          aggregates.set(
            rec.careerId,
            (aggregates.get(rec.careerId) ?? 0) + weight * rec.matchScore,
          );
        }

        const maxAgg = Math.max(...Array.from(aggregates.values()), 0);
        if (maxAgg > 0) {
          blended = scored.map((item) => {
            const cf = aggregates.get(item.career.id) ?? 0;
            const cfScore = Math.round((cf / maxAgg) * 100);
            const finalScore = Math.round(item.score * 0.7 + cfScore * 0.3);
            return { ...item, score: Math.min(100, finalScore) };
          });
        }
      }
    }

    blended = blended.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const demandA = a.career.localDemand ?? 0;
      const demandB = b.career.localDemand ?? 0;
      if (demandB !== demandA) return demandB - demandA;
      return a.career.name.localeCompare(b.career.name);
    });

    const responseLimit = Math.min(dto.limit ?? 6, 20);
    const canonicalPersistLimit = 20;
    const top = blended.slice(0, responseLimit);

    if (!isCanonicalMode) {
      return top.map((item, index) => ({
        id: `virtual-${result.id}-${item.career.id}`,
        resultId: result.id,
        careerId: item.career.id,
        matchScore: item.score,
        rankPosition: index + 1,
        viewedAt: null,
        savedForLater: false,
        createdAt: new Date(),
        career: item.career,
      }));
    }

    const canonicalTop = blended.slice(0, canonicalPersistLimit);
    const topCareerIds = canonicalTop.map((item) => item.career.id);
    const saved = await this.prisma.$transaction(async (tx) => {
      await tx.assessmentCareerRecommendation.deleteMany({
        where: {
          resultId: result.id,
          ...(topCareerIds.length > 0 ? { careerId: { notIn: topCareerIds } } : {}),
        },
      });

      const allSaved = await Promise.all(
        canonicalTop.map((item, index) =>
          tx.assessmentCareerRecommendation.upsert({
            where: {
              resultId_careerId: {
                resultId: result.id,
                careerId: item.career.id,
              },
            },
            update: {
              matchScore: item.score,
              rankPosition: index + 1,
            },
            create: {
              resultId: result.id,
              careerId: item.career.id,
              matchScore: item.score,
              rankPosition: index + 1,
            },
          }),
        ),
      );
      return allSaved.slice(0, responseLimit);
    });

    return saved.map((rec, idx) => ({
      ...rec,
      career: top[idx]?.career ?? null,
    }));
  }

  async getCareerRecommendations(
    dto: GetRecommendationsDto,
    sessionToken: string,
  ): Promise<CareerRecommendationOutput[]> {
    return this.buildCareerRecommendations(dto, sessionToken);
  }

  async getRecommendations(
    dto: GetRecommendationsDto,
    sessionToken: string,
  ): Promise<CareerRecommendationOutput[]> {
    return this.getCareerRecommendations(dto, sessionToken);
  }

  // =====================================================
  // FORMATIONS + UNIVERSITÉS (persistance combinée)
  // =====================================================

  async getFormationRecommendations(
    dto: GetRecommendationsDto,
    sessionToken: string,
  ): Promise<FormationRecommendation[]> {
    const { result } = await this.resolveAssessmentResult(dto, sessionToken);

    const hasGeo = dto.latitude !== undefined && dto.longitude !== undefined;
    const isCanonicalMode = !hasGeo && !dto.category && !dto.advanced;
    const limit = Math.min(dto.limit ?? 6, 20);

    // --- Lecture depuis le cache DB si mode canonique ---
    if (!dto.force && isCanonicalMode) {
      const cached = await this.prisma.assessmentFormationRecommendation.findMany({
        where: { resultId: result.id },
        include: { formation: { include: { university: true } } },
        orderBy: { rankPosition: 'asc' },
        take: limit,
      });

      if (cached.length > 0) {
        const valid = cached.filter(
          (entry) => entry.formation.universityId !== null && entry.formation.university !== null,
        );

        const scholarshipsByFormation = await this.loadScholarshipsForFormations(
          valid.map((entry) => ({
            id: entry.formation.id,
            degree: entry.formation.degree,
            field: entry.formation.field,
            universityId: entry.formation.universityId as number,
          })),
        );

        return valid.map((entry) => ({
          formation: {
            id: entry.formation.id,
            name: entry.formation.title,
            title: entry.formation.title,
            degree: entry.formation.degree,
            duration: entry.formation.duration,
            field: entry.formation.field,
            costMin: entry.formation.costMin,
            costMax: entry.formation.costMax,
            universityId: entry.formation.universityId as number,
          },
          university: {
            id: entry.formation.university!.id,
            name: entry.formation.university!.name,
            latitude: entry.formation.university!.latitude,
            longitude: entry.formation.university!.longitude,
            city: entry.formation.university!.city,
            address: entry.formation.university!.address,
            website: entry.formation.university!.website,
          },
          score: entry.matchScore,
          scholarships: scholarshipsByFormation.get(entry.formation.id) ?? [],
        }));
      }
    }

    // --- Calcul complet à partir des recommandations de carrières ---
    const careerRecommendations = await this.getCareerRecommendations(dto, sessionToken);
    const careerScoreMap = new Map<number, number>();
    for (const rec of careerRecommendations) {
      careerScoreMap.set(
        rec.careerId,
        Math.max(careerScoreMap.get(rec.careerId) ?? 0, rec.matchScore),
      );
    }

    const careerIds = Array.from(careerScoreMap.keys());
    if (careerIds.length === 0) return [];

    const careers = await this.prisma.career.findMany({
      where: { id: { in: careerIds } },
      include: {
        institutions: {
          include: {
            formation: {
              include: {
                university: {
                  select: {
                    id: true,
                    name: true,
                    latitude: true,
                    longitude: true,
                    city: true,
                    address: true,
                    website: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const radiusKm = dto.radiusKm ?? 50;
    const formationMap = new Map<number, FormationRecommendation>();

    for (const career of careers as CareerWithInstitutions[]) {
      const parentScore = careerScoreMap.get(career.id) ?? 0;
      const careerFormations = career.institutions;
      for (const link of careerFormations) {
        const formation = link.formation;
        const university = formation?.university;
        if (!formation || !university || formation.universityId === null) continue;

        let score = parentScore + (link.isPrimary ? 3 : 0);
        if (hasGeo && dto.latitude !== undefined && dto.longitude !== undefined) {
          score += this.getProximityBonus(
            { lat: dto.latitude, lon: dto.longitude },
            { lat: university.latitude, lon: university.longitude },
            radiusKm,
          );
        }
        score = Math.min(100, score);

        const existing = formationMap.get(formation.id);
        if (existing && existing.score >= score) continue;

        formationMap.set(formation.id, {
          formation: {
            id: formation.id,
            name: formation.title,
            title: formation.title,
            degree: formation.degree,
            duration: formation.duration,
            field: formation.field,
            costMin: formation.costMin,
            costMax: formation.costMax,
            universityId: formation.universityId,
          },
          university: {
            id: university.id,
            name: university.name,
            latitude: university.latitude,
            longitude: university.longitude,
            city: university.city,
            address: university.address,
            website: university.website,
          },
          score,
          scholarships: [],
        });
      }
    }

    const ranked = Array.from(formationMap.values()).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.formation.name.localeCompare(b.formation.name);
    });

    const scholarshipsByFormation = await this.loadScholarshipsForFormations(
      ranked.map((entry) => ({
        id: entry.formation.id,
        degree: entry.formation.degree,
        field: entry.formation.field,
        universityId: entry.formation.universityId,
      })),
    );

    const withScholarships = ranked.map((entry) => ({
      ...entry,
      scholarships: scholarshipsByFormation.get(entry.formation.id) ?? [],
    }));

    const top = withScholarships.slice(0, limit);

    // --- Persistance formations + universités, uniquement en mode canonique ---
    if (isCanonicalMode) {
      await this.persistFormationAndUniversityRecommendations(result.id, withScholarships);
    }

    return top;
  }

  private async persistFormationAndUniversityRecommendations(
    resultId: string,
    ranked: FormationRecommendation[],
  ) {
    const canonicalPersistLimit = 20;
    const canonicalTop = ranked.slice(0, canonicalPersistLimit);
    const formationIds = canonicalTop.map((entry) => entry.formation.id);

    // Agrégation université : on garde le meilleur score de formation par université
    const universityScoreMap = new Map<number, number>();
    for (const entry of canonicalTop) {
      const uniId = entry.university.id;
      universityScoreMap.set(uniId, Math.max(universityScoreMap.get(uniId) ?? 0, entry.score));
    }
    const rankedUniversities = Array.from(universityScoreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, canonicalPersistLimit);
    const universityIds = rankedUniversities.map(([id]) => id);

    await this.prisma.$transaction(async (tx) => {
      // Formations
      await tx.assessmentFormationRecommendation.deleteMany({
        where: {
          resultId,
          ...(formationIds.length > 0 ? { formationId: { notIn: formationIds } } : {}),
        },
      });
      await Promise.all(
        canonicalTop.map((entry, index) =>
          tx.assessmentFormationRecommendation.upsert({
            where: {
              resultId_formationId: { resultId, formationId: entry.formation.id },
            },
            update: { matchScore: entry.score, rankPosition: index + 1 },
            create: {
              resultId,
              formationId: entry.formation.id,
              matchScore: entry.score,
              rankPosition: index + 1,
            },
          }),
        ),
      );

      // Universités
      await tx.assessmentUniversityRecommendation.deleteMany({
        where: {
          resultId,
          ...(universityIds.length > 0 ? { universityId: { notIn: universityIds } } : {}),
        },
      });
      await Promise.all(
        rankedUniversities.map(([universityId, score], index) =>
          tx.assessmentUniversityRecommendation.upsert({
            where: { resultId_universityId: { resultId, universityId } },
            update: { matchScore: score, rankPosition: index + 1 },
            create: { resultId, universityId, matchScore: score, rankPosition: index + 1 },
          }),
        ),
      );
    });
  }

  // =====================================================
  // UNIVERSITÉS — lecture des données sauvegardées
  // =====================================================

  async getSavedUniversityRecommendations(
    sessionToken: string,
    assessmentId?: string,
  ): Promise<UniversityRecommendationOutput[]> {
    const { result } = await this.resolveAssessmentResult(
      { assessmentId } as GetRecommendationsDto,
      sessionToken,
    );

    const recommendations = await this.prisma.assessmentUniversityRecommendation.findMany({
      where: { resultId: result.id },
      include: { university: true },
      orderBy: { rankPosition: 'asc' },
    });

    return recommendations.map((rec) => ({
      id: rec.id,
      resultId: rec.resultId,
      universityId: rec.universityId,
      matchScore: rec.matchScore,
      rankPosition: rec.rankPosition,
      viewedAt: rec.viewedAt,
      savedForLater: rec.savedForLater,
      createdAt: rec.createdAt,
      university: rec.university
        ? {
            id: rec.university.id,
            name: rec.university.name,
            latitude: rec.university.latitude,
            longitude: rec.university.longitude,
            city: rec.university.city,
            address: rec.university.address,
            website: rec.university.website,
          }
        : null,
    }));
  }

  // =====================================================
  // ORCHESTRATION — appelée une fois à l'issue du test
  // =====================================================

  /**
   * Calcule et persiste les recommandations de carrières, formations et
   * universités pour un résultat de test. Idéalement appelée une seule fois,
   * juste après le calcul du résultat (ResultsService.compute()), ou via un
   * endpoint de finalisation dédié.
   */
  async finalizeTestRecommendations(
    sessionToken: string,
    assessmentId?: string,
  ): Promise<{
    careers: CareerRecommendationOutput[];
    formations: FormationRecommendation[];
    universities: UniversityRecommendationOutput[];
  }> {
    const canonicalDto: GetRecommendationsDto = {
      ...(assessmentId !== undefined ? { assessmentId } : {}),
      force: true, // force le recalcul + la persistance, ignore le cache
      limit: 6,
    };

    const careers = await this.getCareerRecommendations(canonicalDto, sessionToken);
    const formations = await this.getFormationRecommendations(canonicalDto, sessionToken);
    const universities = await this.getSavedUniversityRecommendations(sessionToken, assessmentId);

    this.logger.log(
      `Recommandations finalisées: ${careers.length} carrières, ${formations.length} formations, ${universities.length} universités`,
    );

    return { careers, formations, universities };
  }
}
