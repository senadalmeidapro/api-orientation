import { ResponsesService } from './responses.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { BadgesService } from '../badges/badges.service';
import { TestStatus, TestType } from '@prisma/client';

const prisma = {
  session: { findUnique: jest.fn() },
  assessment: { findFirst: jest.fn(), update: jest.fn() },
  question: { findMany: jest.fn() },
  response: { upsert: jest.fn(), findMany: jest.fn() },
  assessmentResult: { findUnique: jest.fn() },
  assessmentCareerRecommendation: { deleteMany: jest.fn() },
  treasureMap: { deleteMany: jest.fn() },
  $transaction: jest.fn().mockImplementation((args: any[]) => Promise.all(args)),
} as any;

describe('ResponsesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((args: any[]) => Promise.all(args));
  });

  it('rejects invalid questions', async () => {
    prisma.session.findUnique.mockResolvedValue({ id: 1 });
    prisma.assessment.findFirst.mockResolvedValue({
      id: 'a1',
      sessionId: 1,
      status: TestStatus.IN_PROGRESS,
      currentCategory: TestType.OCCUPATIONS,
      testVersionId: 1,
      depth: 5,
      type: TestType.OCCUPATIONS,
    });
    prisma.question.findMany.mockResolvedValue([]);

    const badges = { grantSpecificCompleted: jest.fn() } as unknown as BadgesService;
    const service = new ResponsesService(prisma, badges, {} as any, {} as any, {} as any);

    await expect(
      service.saveResponse({
        sessionToken: 'tok',
        responses: [{ questionId: 1, responseValue: 1 }],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when session not found', async () => {
    prisma.session.findUnique.mockResolvedValue(null);
    const badges = { grantGeneralCompleted: jest.fn() } as unknown as BadgesService;
    const service = new ResponsesService(prisma, badges, {} as any, {} as any, {} as any);

    await expect(
      service.saveResponse({ sessionToken: 'tok', responses: [] } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
