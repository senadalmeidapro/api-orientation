import { QuestionsService } from './questions.service';

const prisma = {
    userTestSession: { findUnique: jest.fn() },
    language: { findUnique: jest.fn() },
    phase1Question: { findMany: jest.fn() },
    phase2Question: { findMany: jest.fn() },
} as any;

describe('QuestionsService', () => {
    it('returns phase1 questions with translations', async () => {
        prisma.userTestSession.findUnique.mockResolvedValue({ testVersionId: 1 });
        prisma.language.findUnique.mockResolvedValue({ id: 1 });
        prisma.phase1Question.findMany.mockResolvedValue([
            {
                id: 1,
                riasecTypeId: 'R',
                questionText: 'q',
                translations: [{ questionText: 't' }],
            },
        ]);

        const service = new QuestionsService(prisma);
        const res = await service.getPhase1Questions({ sessionToken: 's', lang: 'fr' } as any);

        expect(res[0].text).toBe('t');
    });
});
