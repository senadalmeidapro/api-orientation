import { Injectable, NotFoundException } from '@nestjs/common';
import { InteractionEntityType, InteractionEventType, UserFeature } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AdaptiveCacheService } from './adaptive-cache.service';
import { FEATURE_CACHE_TTL_SECONDS } from './adaptive.constants';

const EMPTY_FEATURES = {
    avgResponseTime: 0,
    responseVariance: 0,
    completionRate: 0,
    riasecConsistency: 0,
    explorationScore: 0,
};

@Injectable()
export class FeatureService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: AdaptiveCacheService,
    ) {
    }

    private cacheKey(userId: string) {
        return `adaptive:user-features:${userId}`;
    }

    async getUserFeatures(userId: string) {
        const cached = await this.cache.get<UserFeature>(this.cacheKey(userId));
        if (cached) return cached;

        const existing = await this.prisma.userFeature.findUnique({
            where: { userId },
        });
        if (existing) {
            await this.cache.set(this.cacheKey(userId), existing, FEATURE_CACHE_TTL_SECONDS);
            return existing;
        }

        return this.updateUserFeatures(userId);
    }

    async computeUserFeatures(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true },
        });
        if (!user) throw new NotFoundException('Utilisateur introuvable');

        const [
            answerEvents,
            completionStats,
            latestResult,
            exploredCareersRows,
            viewedRecommendations,
        ] = await Promise.all([
            this.prisma.interactionEvent.findMany({
                where: { userId, type: InteractionEventType.ANSWER, value: { not: null } },
                select: { value: true },
            }),
            this.prisma.userTestSession.aggregate({
                where: { userId },
                _avg: { completionPercentage: true },
            }),
            this.prisma.userResult.findFirst({
                where: { session: { userId } },
                orderBy: { createdAt: 'desc' },
                select: { consistencyScore: true },
            }),
            this.prisma.interactionEvent.findMany({
                where: {
                    userId,
                    entityType: InteractionEntityType.CAREER,
                    type: { in: [InteractionEventType.VIEW, InteractionEventType.CLICK] },
                },
                distinct: ['entityId'],
                select: { entityId: true },
            }),
            this.prisma.interactionEvent.count({
                where: {
                    userId,
                    entityType: InteractionEntityType.RECOMMENDATION,
                    type: InteractionEventType.VIEW,
                },
            }),
        ]);

        const times = answerEvents
            .map((e) => e.value ?? 0)
            .filter((v) => typeof v === 'number' && Number.isFinite(v) && v > 0);

        let avgResponseTime = 0;
        let responseVariance = 0;
        if (times.length) {
            avgResponseTime = times.reduce((sum, v) => sum + v, 0) / times.length;
            responseVariance =
                times.reduce((sum, v) => sum + (v - avgResponseTime) ** 2, 0) / times.length;
        }

        const completionRate = (completionStats._avg.completionPercentage ?? 0) / 100;
        const riasecConsistency = (latestResult?.consistencyScore ?? 0) / 3;
        const exploredCareers = exploredCareersRows.length;
        const explorationScore =
            viewedRecommendations > 0 ? exploredCareers / viewedRecommendations : 0;

        return {
            userId,
            ...EMPTY_FEATURES,
            avgResponseTime,
            responseVariance,
            completionRate,
            riasecConsistency,
            explorationScore,
        };
    }

    async updateUserFeatures(userId: string) {
        const computed = await this.computeUserFeatures(userId);
        const saved = await this.prisma.userFeature.upsert({
            where: { userId },
            update: {
                avgResponseTime: computed.avgResponseTime,
                responseVariance: computed.responseVariance,
                completionRate: computed.completionRate,
                riasecConsistency: computed.riasecConsistency,
                explorationScore: computed.explorationScore,
            },
            create: {
                userId,
                avgResponseTime: computed.avgResponseTime,
                responseVariance: computed.responseVariance,
                completionRate: computed.completionRate,
                riasecConsistency: computed.riasecConsistency,
                explorationScore: computed.explorationScore,
            },
        });

        await this.cache.set(this.cacheKey(userId), saved, FEATURE_CACHE_TTL_SECONDS);
        return saved;
    }
}
