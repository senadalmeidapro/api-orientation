import { Injectable, NotFoundException } from '@nestjs/common';
import { Career, RiasecType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AdaptiveCacheService } from './adaptive-cache.service';
import {
    DEFAULT_RECOMMENDATION_LIMIT,
    RECOMMENDATION_CACHE_TTL_SECONDS,
    RECOMMENDATION_MODEL_VERSION,
    RESPONSE_VARIANCE_THRESHOLD,
} from './adaptive.constants';
import { AdaptiveProfile, RecommendationScoreContext, RiasecProfile } from './adaptive.types';
import { AdaptiveProfileService } from './adaptive-profile.service';
import { FeatureService } from './feature.service';

type RecommendationItem = {
    career: Career;
    score: number;
    confidence: number;
    modelVersion: string;
};

@Injectable()
export class RecommendationEngine {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: AdaptiveCacheService,
        private readonly profileService: AdaptiveProfileService,
        private readonly featureService: FeatureService,
    ) {
    }

    private cacheKey(userId: string, limit: number) {
        return `adaptive:recommendations:${userId}:${limit}`;
    }

    private riasecMatchScore(profile: RiasecProfile, codes: RiasecType[]) {
        if (!codes.length) return 0;
        const sum = codes.reduce((total, code) => total + (profile[code] ?? 0), 0);
        return sum / codes.length;
    }

    private hasOverlap(source: RiasecType[], target: RiasecType[]) {
        return source.some((code) => target.includes(code));
    }

    private buildScoreContext(params: {
        career: Career;
        profile: AdaptiveProfile;
        responseVariance: number;
        avgResponseTime: number;
        explorationScore: number;
        likedCareers: Career[];
        dislikedCareers: Career[];
        interactionCount: number;
    }): RecommendationScoreContext {
        const riasecScore = this.riasecMatchScore(params.profile.riasec, params.career.riasecCodes);

        const highVariance = params.responseVariance > RESPONSE_VARIANCE_THRESHOLD ? 1 : 0;
        const behaviorWeight = 1 + params.explorationScore * 0.2 - highVariance * 0.1;

        const matchedLiked = params.likedCareers.some((liked) =>
            this.hasOverlap(liked.riasecCodes, params.career.riasecCodes),
        );
        const matchedDisliked = params.dislikedCareers.some((disliked) =>
            this.hasOverlap(disliked.riasecCodes, params.career.riasecCodes),
        );

        let feedbackBoost = 0;
        if (matchedDisliked) feedbackBoost = -0.5;
        else if (matchedLiked) feedbackBoost = 0.3;

        const score = riasecScore * 0.6 + behaviorWeight * 0.2 + feedbackBoost * 0.2;
        const confidence = Math.min(1, params.interactionCount / 50);

        return {
            score,
            confidence,
            riasecScore,
            behaviorWeight,
            feedbackBoost,
            explorationScore: params.explorationScore,
            responseVariance: params.responseVariance,
            avgResponseTime: params.avgResponseTime,
            matchedLiked,
            matchedDisliked,
        };
    }

    private async loadPreferenceCareers(profile: AdaptiveProfile) {
        const likedIds = profile.preferences.likedCareers;
        const dislikedIds = profile.preferences.dislikedCareers;
        const ids = [...new Set([...likedIds, ...dislikedIds])];
        if (!ids.length) {
            return { liked: [] as Career[], disliked: [] as Career[] };
        }

        const careers = await this.prisma.career.findMany({
            where: { id: { in: ids } },
            select: { id: true, riasecCodes: true },
        });

        const byId = new Map(careers.map((career) => [career.id, career]));
        return {
            liked: likedIds.map((id) => byId.get(id)).filter((c): c is Career => Boolean(c)),
            disliked: dislikedIds.map((id) => byId.get(id)).filter((c): c is Career => Boolean(c)),
        };
    }

    async getScoreContext(userId: string, careerId: number) {
        const career = await this.prisma.career.findUnique({
            where: { id: careerId },
        });
        if (!career) throw new NotFoundException('Métier introuvable');

        const [profile, features, interactionCount] = await Promise.all([
            this.profileService.computeAdaptiveProfile(userId),
            this.featureService.getUserFeatures(userId),
            this.prisma.interactionEvent.count({ where: { userId } }),
        ]);
        const preferenceCareers = await this.loadPreferenceCareers(profile);

        return this.buildScoreContext({
            career,
            profile,
            responseVariance: features.responseVariance,
            avgResponseTime: features.avgResponseTime,
            explorationScore: features.explorationScore,
            likedCareers: preferenceCareers.liked,
            dislikedCareers: preferenceCareers.disliked,
            interactionCount,
        });
    }

    async computeDynamicScore(userId: string, careerId: number) {
        const context = await this.getScoreContext(userId, careerId);
        return { score: context.score, confidence: context.confidence };
    }

    async getRecommendations(userId: string, limit = DEFAULT_RECOMMENDATION_LIMIT) {
        const cached = await this.cache.get<RecommendationItem[]>(this.cacheKey(userId, limit));
        if (cached) return cached;
        return this.computeRecommendations(userId, limit, true);
    }

    async precomputeRecommendations(userId: string, limit = DEFAULT_RECOMMENDATION_LIMIT) {
        await this.computeRecommendations(userId, limit, true);
    }

    private async computeRecommendations(userId: string, limit: number, setCache: boolean) {
        const [profile, features, careers, interactionCount] = await Promise.all([
            this.profileService.computeAdaptiveProfile(userId),
            this.featureService.getUserFeatures(userId),
            this.prisma.career.findMany({ where: { isActive: true } }),
            this.prisma.interactionEvent.count({ where: { userId } }),
        ]);

        const preferenceCareers = await this.loadPreferenceCareers(profile);

        const scored = careers.map((career) => {
            const context = this.buildScoreContext({
                career,
                profile,
                responseVariance: features.responseVariance,
                avgResponseTime: features.avgResponseTime,
                explorationScore: features.explorationScore,
                likedCareers: preferenceCareers.liked,
                dislikedCareers: preferenceCareers.disliked,
                interactionCount,
            });
            return {
                career,
                score: context.score,
                confidence: context.confidence,
                modelVersion: RECOMMENDATION_MODEL_VERSION,
            };
        });

        const sorted = scored.sort((a, b) => b.score - a.score).slice(0, limit);

        await this.prisma.recommendationScore.createMany({
            data: sorted.map((item) => ({
                userId,
                careerId: item.career.id,
                score: item.score,
                confidence: item.confidence,
                modelVersion: item.modelVersion,
            })),
        });

        if (setCache) {
            await this.cache.set(
                this.cacheKey(userId, limit),
                sorted,
                RECOMMENDATION_CACHE_TTL_SECONDS,
            );
        }

        return sorted;
    }
}
