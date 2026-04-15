import { ResponsesService } from './responses.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BadgesService } from '../badges/badges.service';
import { AssessmentStatus, AssessmentType, Phase2Type, PhaseType } from '@prisma/client';

const prisma = {
    session: { findUnique: jest.fn() },
    assessment: { findFirst: jest.fn(), update: jest.fn() },
    phase2Question: { findMany: jest.fn() },
    phase2Response: { upsert: jest.fn(), findMany: jest.fn() },
    assessmentResult: { findUnique: jest.fn() },
    assessmentCareerRecommendation: { deleteMany: jest.fn() },
    treasureMap: { deleteMany: jest.fn() },
    $transaction: jest.fn().mockImplementation((args: any[]) => Promise.all(args)),
} as any;

describe('ResponsesService', () => {
    it('rejects phase2 if phase1 prerequisite missing', async () => {
        prisma.session.findUnique.mockResolvedValue({ id: 1 });
        prisma.assessment.findFirst
            .mockResolvedValueOnce({
                id: 'a1',
                sessionId: 1,
                status: AssessmentStatus.IN_PROGRESS,
                currentPhase: PhaseType.PHASE_2,
                currentSection: Phase2Type.OCCUPATIONS,
                testVersionId: 1,
                depth: 5,
                type: AssessmentType.PHASE2_OCCUPATIONS,
            })
            .mockResolvedValueOnce(null);

        const badges = { grantPhase2Completed: jest.fn() } as unknown as BadgesService;
        const service = new ResponsesService(prisma, badges);

        await expect(
            service.savePhase2({
                sessionToken: 'tok',
                responses: [{ questionId: 1, responseValue: 1 }],
            } as any),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws when session not found', async () => {
        prisma.session.findUnique.mockResolvedValue(null);
        const badges = { grantPhase1Completed: jest.fn() } as unknown as BadgesService;
        const service = new ResponsesService(prisma, badges);

        await expect(
            service.savePhase1({ sessionToken: 'tok', responses: [] } as any),
        ).rejects.toBeInstanceOf(NotFoundException);
    });
});
