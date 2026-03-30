import { ScoringService } from './scoring.service';
import { Phase2Type } from '@prisma/client';

const prisma = {
    assessment: { findUnique: jest.fn() },
    phase1Question: { findMany: jest.fn() },
    phase2Question: { findMany: jest.fn() },
    phase1Response: { findMany: jest.fn() },
    phase2Response: { findMany: jest.fn() },
} as any;

describe('ScoringService', () => {
    it('computes codes', async () => {
        prisma.assessment.findUnique.mockResolvedValue({ testVersionId: 1 });
        prisma.phase1Question.findMany.mockResolvedValue([{ riasecTypeId: 'R' }]);
        prisma.phase2Question.findMany.mockResolvedValue([
            { riasecTypeId: 'I', phase2Type: Phase2Type.OCCUPATIONS, maxValue: 1 },
        ]);
        prisma.phase1Response.findMany.mockResolvedValue([
            { responseValue: 1, question: { riasecTypeId: 'R' } },
        ]);
        prisma.phase2Response.findMany.mockResolvedValue([
            { responseValue: 1, question: { riasecTypeId: 'I', phase2Type: 'OCCUPATIONS' } },
        ]);

        const service = new ScoringService(prisma);
        const res = await service.computeScores('a1', {
            phase1AssessmentId: 'a1',
            phase2Types: [Phase2Type.OCCUPATIONS],
        });

        expect(res.phase1Code?.startsWith('R')).toBe(true);
        expect(res.phase2Code?.startsWith('I')).toBe(true);
    });
});
