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
            session_id: 1,
            status: AssessmentStatus.IN_PROGRESS,
            current_phase: PhaseType.PHASE1,
            test_version_id: 1,
            depth: 5,
        });
        prisma.language.findUnique.mockResolvedValue({ id: 1 });
        prisma.phase1Response.findMany.mockResolvedValue([]);
        prisma.phase1Question.findMany.mockResolvedValue([
            {
                id: 1,
                riasec_type_id: 'R',
                question_text: 'q',
                question_short: null,
                illustration_url: null,
                pointsValue: 10,
                display_order: 1,
                translations: [{ question_text: 't', question_short: null }],
            },
        ]);

        const cache = { get: jest.fn().mockResolvedValue(null), set: jest.fn() } as any;
        const adaptive = {} as any;
        const batch = {} as any;
        const service = new QuestionsService(prisma, cache, adaptive, batch);
        const res = await service.getPhase1Questions({ sessionToken: 's', lang: 'fr' });

        expect(res[0].text).toBe('t');
    });
});
