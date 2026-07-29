import { QuestionsService } from './questions.service';
import { TestStatus, TestType } from '@prisma/client';

const prisma = {
  session: { findUnique: jest.fn() },
  assessment: { findFirst: jest.fn() },
  question: { findMany: jest.fn() },
  response: { findMany: jest.fn() },
} as any;

describe('QuestionsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns general questions', async () => {
    prisma.session.findUnique.mockResolvedValue({ id: 1 });
    prisma.assessment.findFirst.mockResolvedValue({
      id: 'a1',
      sessionId: 1,
      status: TestStatus.IN_PROGRESS,
      currentCategory: TestType.GENERALE,
      testVersionId: 1,
      depth: 5,
    });
    prisma.response.findMany.mockResolvedValue([]);
    prisma.question.findMany.mockResolvedValue([
      {
        id: 1,
        riasecTypeId: 'R',
        category: TestType.GENERALE,
        questionText: 'q',
        mediaUrl: null,
        minValue: 0,
        maxValue: 1,
        valueLabels: null,
        pointsValue: 10,
        displayOrder: 1,
      },
    ]);

    const cache = { get: jest.fn().mockResolvedValue(null), set: jest.fn() } as any;
    const adaptive = {} as any;
    const batch = {} as any;
    const service = new QuestionsService(prisma, cache, adaptive, batch);
    const res = await service.getQuestions({
      sessionToken: 's',
      currentCategory: TestType.GENERALE,
    });

    expect(res[0]?.text).toBe('q');
  });
});
