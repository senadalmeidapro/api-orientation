import { Injectable, NotFoundException } from '@nestjs/common';
import { FeedbackType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AdaptiveCacheService } from './adaptive-cache.service';
import { PROFILE_CACHE_TTL_SECONDS, RESPONSE_SPEED_MAX_MS } from './adaptive.constants';
import { AdaptiveProfile, RiasecProfile } from './adaptive.types';
import { FeatureService } from './feature.service';

const EMPTY_RIASEC: RiasecProfile = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

@Injectable()
export class AdaptiveProfileService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: AdaptiveCacheService,
        private readonly featureService: FeatureService,
    ) {
    }

    private cacheKey(userId: string) {
        return `adaptive:profile:${userId}`;
    }

    private normalizeSpeed(avgResponseTime: number) {
        if (!avgResponseTime) return 0;
        const normalized = 1 - avgResponseTime / RESPONSE_SPEED_MAX_MS;
        return Math.max(0, Math.min(1, normalized));
    }

    private asRecord(value: unknown): Record<string, unknown> | null {
        if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
        return value as Record<string, unknown>;
    }

    private getNumber(record: Record<string, unknown> | null, key: string) {
        const value = record?.[key];
        return typeof value === 'number' && Number.isFinite(value) ? value : 0;
    }

    private extractRiasecScores(
        result: {
            sectionScores?: unknown;
            phase2Scores?: unknown;
        } | null,
    ): RiasecProfile {
        const sectionScores = this.asRecord(result?.sectionScores);
        const totalNormalized = this.asRecord(sectionScores?.totalNormalized);
        if (totalNormalized) {
            return {
                R: this.getNumber(totalNormalized, 'R') / 100,
                I: this.getNumber(totalNormalized, 'I') / 100,
                A: this.getNumber(totalNormalized, 'A') / 100,
                S: this.getNumber(totalNormalized, 'S') / 100,
                E: this.getNumber(totalNormalized, 'E') / 100,
                C: this.getNumber(totalNormalized, 'C') / 100,
            };
        }

        const rawScores = this.asRecord(result?.phase2Scores);
        if (!rawScores) return { ...EMPTY_RIASEC };
        const values = Object.values(rawScores).filter(
            (value): value is number => typeof value === 'number' && Number.isFinite(value),
        );
        const max = Math.max(...values, 0);
        if (!max) return { ...EMPTY_RIASEC };

        return {
            R: this.getNumber(rawScores, 'R') / max,
            I: this.getNumber(rawScores, 'I') / max,
            A: this.getNumber(rawScores, 'A') / max,
            S: this.getNumber(rawScores, 'S') / max,
            E: this.getNumber(rawScores, 'E') / max,
            C: this.getNumber(rawScores, 'C') / max,
        };
    }

    async computeAdaptiveProfile(userId: string, options?: { forceRefresh?: boolean }) {
        if (!options?.forceRefresh) {
            const cached = await this.cache.get<AdaptiveProfile>(this.cacheKey(userId));
            if (cached) return cached;
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true },
        });
        if (!user) throw new NotFoundException('Utilisateur introuvable');

        const [features, latestResult, feedbacks] = await Promise.all([
            this.featureService.getUserFeatures(userId),
            this.prisma.userResult.findFirst({
                where: { session: { userId } },
                orderBy: { createdAt: 'desc' },
                select: { phase2Scores: true, sectionScores: true },
            }),
            this.prisma.userFeedback.findMany({
                where: { userId, type: { in: [FeedbackType.LIKE, FeedbackType.DISLIKE] } },
                select: { type: true, recommendation: { select: { careerId: true } } },
            }),
        ]);

        const riasec = this.extractRiasecScores(latestResult);

        const likedCareers = new Set<number>();
        const dislikedCareers = new Set<number>();
        for (const feedback of feedbacks) {
            const careerId = feedback.recommendation?.careerId;
            if (!careerId) continue;
            if (feedback.type === FeedbackType.LIKE) likedCareers.add(careerId);
            if (feedback.type === FeedbackType.DISLIKE) dislikedCareers.add(careerId);
        }

        const profile: AdaptiveProfile = {
            riasec,
            behavior: {
                speed: this.normalizeSpeed(features.avgResponseTime),
                consistency: features.riasecConsistency,
                exploration: features.explorationScore,
            },
            preferences: {
                likedCareers: [...likedCareers],
                dislikedCareers: [...dislikedCareers],
            },
        };

        await this.cache.set(this.cacheKey(userId), profile, PROFILE_CACHE_TTL_SECONDS);
        return profile;
    }
}
