import { ScoringService } from './scoring.service';

const prisma = {
    userTestSession: { findUnique: jest.fn() },
    phase1Question: { findMany: jest.fn() },
    phase2Question: { findMany: jest.fn() },
    phase1Response: { findMany: jest.fn() },
    phase2Response: { findMany: jest.fn() },
} as any;

describe('ScoringService', () => {
    it('computes codes', async () => {
        prisma.userTestSession.findUnique.mockResolvedValue({ testVersionId: 1 });
        prisma.phase1Question.findMany.mockResolvedValue([{ riasecTypeId: 'R' }]);
        prisma.phase2Question.findMany.mockResolvedValue([
            { riasecTypeId: 'I', sectionType: 'OCCUPATIONS', maxValue: 1 },
        ]);
        prisma.phase1Response.findMany.mockResolvedValue([
            { responseValue: 1, question: { riasecTypeId: 'R' } },
        ]);
        prisma.phase2Response.findMany.mockResolvedValue([
            { responseValue: 1, question: { riasecTypeId: 'I', sectionType: 'OCCUPATIONS' } },
        ]);

        const service = new ScoringService(prisma);
        const res = await service.computeScores('s1');

        expect(res.phase1Code.startsWith('R')).toBe(true);
        expect(res.phase2Code.startsWith('I')).toBe(true);
    });
});
