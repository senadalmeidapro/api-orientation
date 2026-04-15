import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetRecommendationsDto } from './dto/get-recommendations.dto';
import { ResultsService } from '../results/results.service';
import { AssessmentStatus, Prisma, RiasecType } from '@prisma/client';
import { CacheService } from '../../common/cache/cache.service';

@Injectable()
export class RecommendationsService {
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

    private getInstitutions(career: unknown) {
        const typed = career as Prisma.CareerGetPayload<{
            include: { institutions: { include: { institution: true } } };
        }>;
        return typed.institutions ?? [];
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
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
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

    private extractNormalizedScores(result: any) {
        const sectionScores = result?.sectionScores;
        const totalNormalized = sectionScores?.totalNormalized ?? null;
        if (totalNormalized && typeof totalNormalized === 'object') {
            return this.normalizeVector(totalNormalized as Record<string, number>);
        }
        if (result?.phase2Scores && typeof result.phase2Scores === 'object') {
            return this.normalizeVector(result.phase2Scores as Record<string, number>);
        }
        if (result?.phase1Scores && typeof result.phase1Scores === 'object') {
            return this.normalizeVector(result.phase1Scores as Record<string, number>);
        }
        return [0, 0, 0, 0, 0, 0];
    }

    async getRecommendations(dto: GetRecommendationsDto) {
        const session = await this.prisma.session.findUnique({
            where: { session_token: dto.sessionToken },
            select: { id: true },
        });
        if (!session) throw new NotFoundException('Session introuvable');

        const assessment = dto.assessmentId
            ? await this.prisma.assessment.findFirst({
                  where: { id: dto.assessmentId, session_id: session.id },
              })
            : await this.prisma.assessment.findFirst({
                  where: { session_id: session.id, status: AssessmentStatus.COMPLETED },
                  orderBy: { completed_at: 'desc' },
              });

        if (!assessment) {
            throw new NotFoundException('Aucun test disponible pour cette session');
        }

        let result = await this.prisma.assessmentResult.findUnique({
            where: { assessment_id: assessment.id },
        });

        if (!result) {
            result = await this.resultsService.compute({
                sessionToken: dto.sessionToken,
                assessmentId: assessment.id,
            });
        }

        const hasGeo = dto.latitude !== undefined && dto.longitude !== undefined;
        if (!dto.force && !dto.advanced && !hasGeo) {
            const cached = await this.prisma.assessmentCareerRecommendation.findMany({
                where: { result_id: result.id },
                include: { career: true },
                orderBy: { rank_position: 'asc' },
                take: dto.limit ?? 6,
            });
            if (cached.length > 0) return cached;
        }

        let careers: any[] | null = null;
        if (!hasGeo) {
            const cacheKey = `careers:active:${dto.category ?? 'all'}`;
            careers = await this.cache.get<any[]>(cacheKey);
            if (!careers) {
                careers = await this.prisma.career.findMany({
                    where: {
                        is_active: true,
                        ...(dto.category ? { category: dto.category } : {}),
                    },
                });
                await this.cache.set(cacheKey, careers, 300);
            }
        }
        if (!careers) {
            careers = await this.prisma.career.findMany({
                where: {
                    is_active: true,
                    ...(dto.category ? { category: dto.category } : {}),
                },
                include: { institutions: { include: { institution: true } } },
            });
        }

        const baseCode = result.phase2_code ?? result.phase1_code;
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
                        const inst = link.institution;
                        if (inst?.latitude == null || inst?.longitude == null) continue;
                        const distance = this.distanceKm(
                            { lat: dto.latitude, lon: dto.longitude },
                            { lat: inst.latitude, lon: inst.longitude },
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
            const recentResults = await this.prisma.assessmentResult.findMany({
                where: {
                    assessment_id: { not: assessment.id },
                },
                select: { id: true, phase2_code: true, section_scores: true, phase2_scores: true },
                orderBy: { created_at: 'desc' },
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
                    where: { result_id: { in: Array.from(similarityMap.keys()) } },
                    select: { result_id: true, career_id: true, match_score: true },
                });

                const aggregates = new Map<number, number>();
                for (const rec of cfRecs) {
                    const weight = similarityMap.get(rec.result_id) ?? 0;
                    if (weight === 0) continue;
                    aggregates.set(
                        rec.career_id,
                        (aggregates.get(rec.career_id) ?? 0) + weight * rec.match_score,
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

        const limit = dto.limit ?? 6;
        const top = blended.slice(0, limit);

        const saved = await this.prisma.$transaction(
            top.map((item, index) =>
                this.prisma.assessmentCareerRecommendation.upsert({
                    where: {
                        result_id_career_id: {
                            result_id: result.id,
                            career_id: item.career.id,
                        },
                    },
                    update: {
                        match_score: item.score,
                        rank_position: index + 1,
                    },
                    create: {
                        result_id: result.id,
                        career_id: item.career.id,
                        match_score: item.score,
                        rank_position: index + 1,
                    },
                }),
            ),
        );

        return saved.map((rec, idx) => ({
            ...rec,
            career: top[idx].career,
        }));
    }
}
