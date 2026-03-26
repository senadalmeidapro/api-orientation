import { Career } from '@prisma/client';
import { RecommendationEngine } from './recommendation-engine.service';

const prisma = {
    career: { findUnique: jest.fn(), findMany: jest.fn() },
    interactionEvent: { count: jest.fn() },
    recommendationScore: { createMany: jest.fn() },
} as any;

const cache = {
    get: jest.fn(),
    set: jest.fn(),
} as any;

const profileService = {
    computeAdaptiveProfile: jest.fn(),
} as any;

const featureService = {
    getUserFeatures: jest.fn(),
} as any;

const makeCareer = (overrides: Partial<Career>): Career => ({
    id: 1,
    name: 'Career',
    description: 'desc',
    summary: null,
    riasecCodes: ['R'],
    localDemand: null,
    formationLevel: null,
    salaryRangeMin: null,
    salaryRangeMax: null,
    careerPath: null,
    iconUrl: null,
    imageUrl: null,
    videoUrl: null,
    category: null,
    tags: [],
    isFeatured: false,
    isActive: true,
    viewCount: 0,
    clickCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

describe('RecommendationEngine', () => {
    it('computes dynamic score with feedback boost', async () => {
        prisma.career.findUnique.mockResolvedValue(
            makeCareer({ id: 100, riasecCodes: ['R', 'I'] }),
        );
        prisma.career.findMany.mockResolvedValue([makeCareer({ id: 1, riasecCodes: ['R'] })]);
        prisma.interactionEvent.count.mockResolvedValue(25);
        profileService.computeAdaptiveProfile.mockResolvedValue({
            riasec: { R: 1, I: 0.8, A: 0, S: 0, E: 0, C: 0 },
            behavior: { speed: 0.5, consistency: 0.6, exploration: 0.5 },
            preferences: { likedCareers: [1], dislikedCareers: [] },
        });
        featureService.getUserFeatures.mockResolvedValue({
            avgResponseTime: 5000,
            responseVariance: 0,
            explorationScore: 0.5,
        });

        const service = new RecommendationEngine(prisma, cache, profileService, featureService);
        const res = await service.computeDynamicScore('u1', 100);

        expect(res.score).toBeCloseTo(0.82, 2);
        expect(res.confidence).toBeCloseTo(0.5, 2);
    });

    it('returns top recommendations by score', async () => {
        cache.get.mockResolvedValue(null);
        prisma.career.findMany.mockResolvedValue([
            makeCareer({ id: 1, riasecCodes: ['R'] }),
            makeCareer({ id: 2, riasecCodes: ['A'] }),
        ]);
        prisma.interactionEvent.count.mockResolvedValue(10);
        prisma.recommendationScore.createMany.mockResolvedValue({ count: 2 });
        profileService.computeAdaptiveProfile.mockResolvedValue({
            riasec: { R: 1, I: 0, A: 0, S: 0, E: 0, C: 0 },
            behavior: { speed: 0.4, consistency: 0.3, exploration: 0 },
            preferences: { likedCareers: [], dislikedCareers: [] },
        });
        featureService.getUserFeatures.mockResolvedValue({
            avgResponseTime: 4000,
            responseVariance: 0,
            explorationScore: 0,
        });

        const service = new RecommendationEngine(prisma, cache, profileService, featureService);
        const res = await service.getRecommendations('u1', 1);

        expect(res[0].career.id).toBe(1);
        expect(cache.set).toHaveBeenCalled();
    });
});
