import { RecommendationsService } from './recommendations.service';
import type { ResultsService } from '../results/results.service';

const prisma = {
    session: { findUnique: jest.fn() },
    assessment: { findFirst: jest.fn() },
    assessmentResult: { findUnique: jest.fn() },
    career: { findMany: jest.fn() },
    assessmentCareerRecommendation: { upsert: jest.fn(), findMany: jest.fn() },
    $transaction: jest.fn().mockImplementation((args: any[]) => Promise.all(args)),
} as any;

describe('RecommendationsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('computes recommendations', async () => {
        prisma.session.findUnique.mockResolvedValue({ id: 1 });
        prisma.assessment.findFirst.mockResolvedValue({ id: 'a1', session_id: 1 });
        prisma.assessmentResult.findUnique.mockResolvedValue({ id: 'r1', phase2_code: 'RIA' });
        prisma.assessmentCareerRecommendation.findMany.mockResolvedValue([]);
        prisma.career.findMany.mockResolvedValue([
            { id: 1, name: 'Tech', riasecCodes: ['R', 'I'], localDemand: 3 },
            { id: 2, name: 'Art', riasecCodes: ['A'], localDemand: 0 },
        ]);
        prisma.assessmentCareerRecommendation.upsert.mockResolvedValue({ id: 1 });

        const resultsService = { compute: jest.fn() } as unknown as ResultsService;
        const cache = { get: jest.fn().mockResolvedValue(null), set: jest.fn() } as any;
        const service = new RecommendationsService(prisma, resultsService, cache);

        const res = await service.getRecommendations({ sessionToken: 'token', limit: 1 } as any);

        expect(res.length).toBe(1);
        expect(res[0].career.name).toBe('Tech');
    });

    it('returns cached recommendations when available', async () => {
        prisma.session.findUnique.mockResolvedValue({ id: 1 });
        prisma.assessment.findFirst.mockResolvedValue({ id: 'a1', session_id: 1 });
        prisma.assessmentResult.findUnique.mockResolvedValue({ id: 'r1', phase2_code: 'RIA' });
        prisma.assessmentCareerRecommendation.findMany.mockResolvedValue([
            { id: 'rec1', career: { id: 1, name: 'Cached' }, match_score: 90, rank_position: 1 },
        ]);

        const resultsService = { compute: jest.fn() } as unknown as ResultsService;
        const cache = { get: jest.fn().mockResolvedValue(null), set: jest.fn() } as any;
        const service = new RecommendationsService(prisma, resultsService, cache);

        const res = await service.getRecommendations({ sessionToken: 'token', limit: 1 } as any);

        expect(res[0].career.name).toBe('Cached');
        expect(prisma.career.findMany).not.toHaveBeenCalled();
    });
});
