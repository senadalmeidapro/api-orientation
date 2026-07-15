import { TestStatus, TestType } from '@prisma/client';
import { AssessmentFlowService } from './assessment-flow.service';

const prisma = {
  testVersion: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  session: {
    findUnique: jest.fn(),
  },
  assessment: {
    findFirst: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
} as any;

describe('AssessmentFlowService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (operations: unknown[]) => Promise.all(operations));
  });

  it('abandons existing in-progress assessments before starting a new one in the same session', async () => {
    prisma.session.findUnique.mockResolvedValue({ id: 'session-1' });
    prisma.testVersion.findUnique.mockResolvedValue({ id: 1 });
    prisma.assessment.updateMany.mockResolvedValue({ count: 1 });
    prisma.assessment.create.mockResolvedValue({
      id: 'assessment-2',
      sessionId: 'session-1',
      type: TestType.GENERALE,
      status: TestStatus.IN_PROGRESS,
    });

    const service = new AssessmentFlowService(prisma);

    const assessment = await service.createAssessmentForSession('token-1', {
      type: TestType.GENERALE,
      testVersionId: 1,
    });

    expect(prisma.assessment.updateMany).toHaveBeenCalledWith({
      where: {
        sessionId: 'session-1',
        status: TestStatus.IN_PROGRESS,
      },
      data: {
        status: TestStatus.ABANDONED,
      },
    });
    expect(prisma.assessment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        sessionId: 'session-1',
        type: TestType.GENERALE,
        status: TestStatus.IN_PROGRESS,
        currentStepIndex: 0,
        completionPercentage: 0,
      }),
    });
    expect(assessment.id).toBe('assessment-2');
  });

  it('starts a full assessment on the first concrete category', async () => {
    prisma.assessment.create.mockResolvedValue({
      id: 'assessment-full',
      sessionId: 'session-1',
      type: TestType.FULL,
      currentCategory: TestType.OCCUPATIONS,
      status: TestStatus.IN_PROGRESS,
    });

    const service = new AssessmentFlowService(prisma);

    const assessment = await service.createAssessment('session-1', 1, {
      type: TestType.FULL,
      depth: 5,
    });

    expect(prisma.assessment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        sessionId: 'session-1',
        type: TestType.FULL,
        currentCategory: TestType.OCCUPATIONS,
        status: TestStatus.IN_PROGRESS,
      }),
    });
    expect(assessment.currentCategory).toBe(TestType.OCCUPATIONS);
  });
});
