import { ResponsesService } from './responses.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BadgesService } from '../badges/badges.service';

const prisma = {
    userTestSession: { findUnique: jest.fn() },
} as any;

describe('ResponsesService', () => {
    it('rejects phase2 if phase1 not completed', async () => {
        prisma.userTestSession.findUnique.mockResolvedValue({
            id: 's1',
            currentPhase: 'PHASE_1',
            phase1CompletedAt: null,
        });
        const badges = { grantPhase1Completed: jest.fn() } as unknown as BadgesService;
        const service = new ResponsesService(prisma, badges);

        await expect(
            service.savePhase2({ sessionToken: 'tok', responses: [] } as any),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws when session not found', async () => {
        prisma.userTestSession.findUnique.mockResolvedValue(null);
        const badges = { grantPhase1Completed: jest.fn() } as unknown as BadgesService;
        const service = new ResponsesService(prisma, badges);

        await expect(
            service.savePhase1({ sessionToken: 'tok', responses: [] } as any),
        ).rejects.toBeInstanceOf(NotFoundException);
    });
});
