import { RiasecType } from '@prisma/client';

export type RiasecProfile = Record<RiasecType, number>;

export type AdaptiveProfile = {
    riasec: RiasecProfile;
    behavior: {
        speed: number;
        consistency: number;
        exploration: number;
    };
    preferences: {
        likedCareers: number[];
        dislikedCareers: number[];
    };
};

export type RecommendationScoreContext = {
    score: number;
    confidence: number;
    riasecScore: number;
    behaviorWeight: number;
    feedbackBoost: number;
    explorationScore: number;
    responseVariance: number;
    avgResponseTime: number;
    matchedLiked: boolean;
    matchedDisliked: boolean;
};
