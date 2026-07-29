import { ScoringService } from './scoring.service';
import { ConsistencyLevel, ProfileStrength, TestType } from '@prisma/client';

const prisma = {
  assessment: { findUnique: jest.fn() },
  question: { findMany: jest.fn() },
  response: { findMany: jest.fn() },
} as any;

describe('ScoringService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('computes codes', async () => {
    prisma.assessment.findUnique.mockResolvedValue({ testVersionId: 1 });
    prisma.question.findMany.mockResolvedValue([
      { riasecTypeId: 'I', category: TestType.OCCUPATIONS, maxValue: 1 },
    ]);
    prisma.response.findMany
      .mockResolvedValueOnce([{ responseValue: 1, question: { riasecTypeId: 'R' } }])
      .mockResolvedValueOnce([
        { responseValue: 1, question: { riasecTypeId: 'I', category: TestType.OCCUPATIONS } },
      ]);

    const service = new ScoringService(prisma, {} as any);
    const res = await service.computeScores('a1', {
      generalAssessmentId: 'a1',
      categories: [TestType.OCCUPATIONS],
    });

    expect(res.generalCode?.startsWith('R')).toBe(true);
    expect(res.specificCode?.startsWith('I')).toBe(true);
  });

  it('normalizes aptitude and computes consistency', async () => {
    prisma.assessment.findUnique.mockResolvedValue({ testVersionId: 1 });
    prisma.question.findMany.mockResolvedValue([
      { riasecTypeId: 'R', category: TestType.APTITUDES, maxValue: 3 },
      { riasecTypeId: 'I', category: TestType.OCCUPATIONS, maxValue: 1 },
    ]);
    prisma.response.findMany
      .mockResolvedValueOnce([
        { responseValue: 1, question: { riasecTypeId: 'R' } },
        { responseValue: 1, question: { riasecTypeId: 'I' } },
        { responseValue: 1, question: { riasecTypeId: 'A' } },
      ])
      .mockResolvedValueOnce([
        { responseValue: 3, question: { riasecTypeId: 'R', category: TestType.APTITUDES } },
        { responseValue: 1, question: { riasecTypeId: 'I', category: TestType.OCCUPATIONS } },
      ]);

    const service = new ScoringService(prisma, {} as any);
    const res = await service.computeScores('a1', {
      generalAssessmentId: 'a1',
      categories: [TestType.OCCUPATIONS, TestType.APTITUDES],
    });

    expect(res.specificNormalizedScores.R).toBe(100);
    expect(res.specificCode?.startsWith('R')).toBe(true);
    expect(res.consistencyLevel).toBe(ConsistencyLevel.FORTE);
    expect(res.profileStrength).toBe(ProfileStrength.EXCEPTIONNEL);
  });
});
