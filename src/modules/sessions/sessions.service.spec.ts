import { SessionsService } from './sessions.service';
import { TestType } from '@prisma/client';

const lifecycleService = {
  createSession: jest.fn(),
  updateProfile: jest.fn(),
  getByToken: jest.fn(),
} as any;

const flowService = {
  resolveTestVersionId: jest.fn(),
  createAssessment: jest.fn(),
  createAssessmentForSession: jest.fn(),
  listAssessments: jest.fn(),
} as any;

describe('SessionsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates session with initial assessment', async () => {
    lifecycleService.createSession.mockResolvedValue({
      id: 1,
      sessionToken: 'token',
      shareToken: 'share',
      createdAt: new Date(),
    });
    flowService.resolveTestVersionId.mockResolvedValue(1);
    flowService.createAssessment.mockResolvedValue({
      id: 'a1',
      type: TestType.GENERALE,
    });

    const service = new SessionsService(lifecycleService, flowService);
    const res = await service.createSession('user-1', { testVersionId: 1 });

    expect(res.sessionToken).toBe('token');
    expect(res.assessment.id).toBe('a1');
  });
});
