import { QuestionsService } from './questions.service';
import { AssessmentStatus, PhaseType } from '@prisma/client';

const prisma = {
    session: { findUnique: jest.fn() },
    assessment: { findFirst: jest.fn() },
    language: { findUnique: jest.fn() },
    phase1Question: { findMany: jest.fn() },
    phase1Response: { findMany: jest.fn() },
} as any;

describe('QuestionsService', () => {
    it('returns phase1 questions with translations', async () => {
        prisma.session.findUnique.mockResolvedValue({ id: 1 });
        prisma.assessment.findFirst.mockResolvedValue({
            id: 'a1',
            sessionId: 1,
            status: AssessmentStatus.IN_PROGRESS,
            currentPhase: PhaseType.PHASE_1,
            testVersionId: 1,
            depth: 5,
        });
        prisma.language.findUnique.mockResolvedValue({ id: 1 });
        prisma.phase1Response.findMany.mockResolvedValue([]);
        prisma.phase1Question.findMany.mockResolvedValue([
            {
                id: 1,
                riasecTypeId: 'R',
                questionText: 'q',
                questionShort: null,
                illustrationUrl: null,
                pointsValue: 10,
                displayOrder: 1,
                translations: [{ questionText: 't', questionShort: null }],
            },
        ]);

        const service = new QuestionsService(prisma);
        const res = await service.getPhase1Questions({ sessionToken: 's', lang: 'fr' } as any);

        expect(res[0].text).toBe('t');
    });
});
