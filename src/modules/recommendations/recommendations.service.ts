import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetRecommendationsDto } from './dto/get-recommendations.dto';
import { ResultsService } from '../results/results.service';
import { AssessmentStatus, Career, RiasecType } from '@prisma/client';
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

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly resultsService: ResultsService,
    private readonly cache: CacheService,
  ) {}

  private buildWeights(phase2Code: string) {
    const letters = phase2Code.split('') as RiasecType[];
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

  private extractNormalizedScores(result: {
    sectionScores?: unknown;
    phase2Scores?: unknown;
    phase1Scores?: unknown;
  }) {
    const sectionScores = result.sectionScores;
    if (this.isRecord(sectionScores)) {
      const totalNormalized = sectionScores.totalNormalized;
      const asNumbers = this.toNumberRecord(totalNormalized);
      if (asNumbers) return this.normalizeVector(asNumbers);
    }

    const phase2 = this.toNumberRecord(result.phase2Scores);
    if (phase2) return this.normalizeVector(phase2);

    const phase1 = this.toNumberRecord(result.phase1Scores);
    if (phase1) return this.normalizeVector(phase1);

    return [0, 0, 0, 0, 0, 0];
  }

  async getRecommendations(dto: GetRecommendationsDto): Promise<CareerRecommendationOutput[]> {
    if (!dto.sessionToken) {
      throw new BadRequestException('Session token requis');
    }

    const session = await this.prisma.session.findFirst({
      where: {
        sessionToken: dto.sessionToken,
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
          where: { sessionId: session.id, status: AssessmentStatus.COMPLETED },
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
        sessionToken: dto.sessionToken,
        assessmentId: assessment.id,
      });
    }

    const hasGeo = dto.latitude !== undefined && dto.longitude !== undefined;
    const isCanonicalMode = !hasGeo && !dto.category && !dto.advanced;

    if (!dto.force && !dto.advanced && !hasGeo && !dto.category) {
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

    const baseCode = result.phase2Code ?? result.phase1Code;
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

    let blended = scored;
    if (dto.advanced) {
      const currentVector = this.extractNormalizedScores(result);
      const contextLookback = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
      const recentResults = await this.prisma.assessmentResult.findMany({
        where: {
          assessmentId: { not: assessment.id },
          createdAt: { gte: contextLookback },
          assessment: {
            status: AssessmentStatus.COMPLETED,
            type: assessment.type,
            testVersionId: assessment.testVersionId,
            currentPhase: assessment.currentPhase,
            ...(assessment.currentSection ? { currentSection: assessment.currentSection } : {}),
          },
        },
        select: { id: true, sectionScores: true, phase2Scores: true, phase1Scores: true },
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

  async getFormationRecommendations(
    dto: GetRecommendationsDto,
  ): Promise<FormationRecommendation[]> {
    const careerRecommendations = await this.getRecommendations(dto);
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

    const hasGeo = dto.latitude !== undefined && dto.longitude !== undefined;
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
        });
      }
    }

    const limit = Math.min(dto.limit ?? 6, 20);
    return Array.from(formationMap.values())
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.formation.name.localeCompare(b.formation.name);
      })
      .slice(0, limit);
  }
}
