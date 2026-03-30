import { RecommendationsService } from './recommendations.service';
import { ResultsService } from '../results/results.service';

const prisma = {
    session: { findUnique: jest.fn() },
    assessment: { findFirst: jest.fn() },
    assessmentResult: { findUnique: jest.fn() },
    career: { findMany: jest.fn() },
    assessmentCareerRecommendation: { upsert: jest.fn() },
    $transaction: jest.fn().mockImplementation((args: any[]) => Promise.all(args)),
} as any;

describe('RecommendationsService', () => {
    it('computes recommendations', async () => {
        prisma.session.findUnique.mockResolvedValue({ id: 1 });
        prisma.assessment.findFirst.mockResolvedValue({ id: 'a1', sessionId: 1 });
        prisma.assessmentResult.findUnique.mockResolvedValue({ id: 'r1', phase2Code: 'RIA' });
        prisma.career.findMany.mockResolvedValue([
            { id: 1, name: 'Tech', riasecCodes: ['R', 'I'], localDemand: 3 },
            { id: 2, name: 'Art', riasecCodes: ['A'], localDemand: 0 },
        ]);
        prisma.assessmentCareerRecommendation.upsert.mockResolvedValue({ id: 1 });

        const resultsService = { compute: jest.fn() } as unknown as ResultsService;
        const service = new RecommendationsService(prisma, resultsService);

        const res = await service.getRecommendations({ sessionToken: 'token', limit: 1 } as any);

        expect(res.length).toBe(1);
        expect(res[0].career.name).toBe('Tech');
    });
});
