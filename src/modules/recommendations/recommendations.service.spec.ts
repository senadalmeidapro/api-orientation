import { RecommendationsService } from './recommendations.service';
import { ResultsService } from '../results/results.service';

const prisma = {
    userTestSession: { findUnique: jest.fn() },
    userResult: { findUnique: jest.fn() },
    career: { findMany: jest.fn() },
    userCareerRecommendation: { upsert: jest.fn() },
    $transaction: jest.fn().mockImplementation((args: any[]) => Promise.all(args)),
} as any;

describe('RecommendationsService', () => {
    it('computes recommendations', async () => {
        prisma.userTestSession.findUnique.mockResolvedValue({ id: 's1' });
        prisma.userResult.findUnique.mockResolvedValue({ id: 1, phase2Code: 'RIA' });
        prisma.career.findMany.mockResolvedValue([
            { id: 1, name: 'Tech', riasecCodes: ['R', 'I'], localDemand: 3 },
            { id: 2, name: 'Art', riasecCodes: ['A'], localDemand: 0 },
        ]);
        prisma.userCareerRecommendation.upsert.mockResolvedValue({ id: 1 });

        const resultsService = {
            compute: jest.fn(),
        } as unknown as ResultsService;
        const recommendationEngine = {
            getRecommendations: jest.fn(),
        } as any;
        const explanationService = {
            explainRecommendation: jest.fn(),
        } as any;

        const service = new RecommendationsService(
            prisma,
            resultsService,
            recommendationEngine,
            explanationService,
        );
        const res = await service.getRecommendations({ sessionToken: 'token', limit: 1 } as any);

        expect(res.length).toBe(1);
        expect(res[0].career.name).toBe('Tech');
    });

    it('delegates adaptive recommendations to engine', async () => {
        const resultsService = {
            compute: jest.fn(),
        } as unknown as ResultsService;
        const recommendationEngine = {
            getRecommendations: jest.fn().mockResolvedValue([{ id: 1 }]),
        } as any;
        const explanationService = {
            explainRecommendation: jest.fn(),
        } as any;

        const service = new RecommendationsService(
            prisma,
            resultsService,
            recommendationEngine,
            explanationService,
        );

        const res = await service.getAdaptiveRecommendations('user-1', { limit: 2 });
        expect(recommendationEngine.getRecommendations).toHaveBeenCalledWith('user-1', 2);
        expect(res.length).toBe(1);
    });
});
