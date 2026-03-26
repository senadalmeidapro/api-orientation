import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetRecommendationsDto } from './dto/get-recommendations.dto';
import { ResultsService } from '../results/results.service';
import { RiasecType } from '@prisma/client';
import { RecommendationEngine } from '../adaptive/recommendation-engine.service';
import { ExplanationService } from '../adaptive/explanation.service';
import { GetAdaptiveRecommendationsDto } from './dto/get-adaptive-recommendations.dto';

@Injectable()
export class RecommendationsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly resultsService: ResultsService,
        private readonly recommendationEngine: RecommendationEngine,
        private readonly explanationService: ExplanationService,
    ) {
    }

    private buildWeights(phase2Code: string) {
        const letters = phase2Code.split('') as RiasecType[];
        const weights: Record<string, number> = {};
        if (letters[0]) weights[letters[0]] = 50;
        if (letters[1]) weights[letters[1]] = 30;
        if (letters[2]) weights[letters[2]] = 20;
        return weights;
    }

    async getRecommendations(dto: GetRecommendationsDto) {
        const session = await this.prisma.userTestSession.findUnique({
            where: { sessionToken: dto.sessionToken },
        });
        if (!session) throw new NotFoundException('Session introuvable');

        let result = await this.prisma.userResult.findUnique({
            where: { sessionId: session.id },
        });

        if (!result) {
            result = await this.resultsService.compute({ sessionToken: dto.sessionToken });
        }

        const careers = await this.prisma.career.findMany({
            where: { isActive: true },
        });

        const weights = this.buildWeights(result.phase2Code);

        const scored = careers
            .map((career) => {
                const codes = career.riasecCodes;
                let sum = 0;
                let matched = 0;
                for (const code of codes) {
                    const w = weights[code] ?? 0;
                    if (w > 0) {
                        sum += w;
                        matched += 1;
                    }
                }
                if (matched === 0) return { career, score: 0 };
                const baseScore = Math.round(sum / Math.max(codes.length, 1));
                const demandBoost = career.localDemand ? career.localDemand * 2 : 0;
                return { career, score: baseScore + demandBoost };
            })
            .filter((c) => c.score > 0)
            .sort((a, b) => b.score - a.score);

        const limit = dto.limit ?? 6;
        const top = scored.slice(0, limit);

        const saved = await this.prisma.$transaction(
            top.map((item, index) =>
                this.prisma.userCareerRecommendation.upsert({
                    where: {
                        resultId_careerId: {
                            resultId: result.id,
                            careerId: item.career.id,
                        },
                    },
                    update: {
                        matchScore: Math.min(100, item.score),
                        rankPosition: index + 1,
                    },
                    create: {
                        resultId: result.id,
                        careerId: item.career.id,
                        matchScore: Math.min(100, item.score),
                        rankPosition: index + 1,
                    },
                }),
            ),
        );

        return saved.map((rec, idx) => ({
            ...rec,
            career: top[idx].career,
        }));
    }

    async getAdaptiveRecommendations(
        userId: string | undefined,
        dto: GetAdaptiveRecommendationsDto,
    ) {
        if (!userId) throw new BadRequestException('Utilisateur requis');
        const limit = dto.limit ?? undefined;
        return this.recommendationEngine.getRecommendations(userId, limit);
    }

    async explainRecommendation(userId: string | undefined, careerId: number) {
        if (!userId) throw new BadRequestException('Utilisateur requis');
        return this.explanationService.explainRecommendation(userId, careerId);
    }
}
