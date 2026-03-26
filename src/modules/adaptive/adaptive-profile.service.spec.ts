import { AdaptiveProfileService } from './adaptive-profile.service';

const prisma = {
    user: { findUnique: jest.fn() },
    userResult: { findFirst: jest.fn() },
    userFeedback: { findMany: jest.fn() },
} as any;

const cache = {
    get: jest.fn(),
    set: jest.fn(),
} as any;

const featureService = {
    getUserFeatures: jest.fn(),
} as any;

describe('AdaptiveProfileService', () => {
    it('computes adaptive profile with preferences and behavior', async () => {
        prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
        prisma.userResult.findFirst.mockResolvedValue({
            sectionScores: { totalNormalized: { R: 80, I: 40, A: 20, S: 10, E: 0, C: 0 } },
        });
        prisma.userFeedback.findMany.mockResolvedValue([
            { type: 'LIKE', recommendation: { careerId: 11 } },
            { type: 'DISLIKE', recommendation: { careerId: 22 } },
        ]);
        featureService.getUserFeatures.mockResolvedValue({
            avgResponseTime: 5000,
            riasecConsistency: 0.6,
            explorationScore: 0.4,
        });

        const service = new AdaptiveProfileService(prisma, cache, featureService);
        const profile = await service.computeAdaptiveProfile('u1');

        expect(profile.riasec.R).toBeCloseTo(0.8);
        expect(profile.behavior.speed).toBeCloseTo(0.5);
        expect(profile.behavior.consistency).toBeCloseTo(0.6);
        expect(profile.preferences.likedCareers).toEqual([11]);
        expect(profile.preferences.dislikedCareers).toEqual([22]);
    });
});
