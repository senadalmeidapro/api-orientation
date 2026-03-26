import { ResultsService } from './results.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ScoringService } from '../scoring/scoring.service';
import { BadgesService } from '../badges/badges.service';

const prisma = {
    userTestSession: { findUnique: jest.fn(), update: jest.fn() },
    userResult: { upsert: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
} as any;

describe('ResultsService', () => {
    it('requires completed test before compute', async () => {
        prisma.userTestSession.findUnique.mockResolvedValue({
            id: 's1',
            phase1CompletedAt: null,
            phase2CompletedAt: null,
        });
        const scoring = { computeScores: jest.fn() } as unknown as ScoringService;
        const badges = { grantTestCompleted: jest.fn() } as unknown as BadgesService;
        const service = new ResultsService(prisma, scoring, badges);

        await expect(service.compute({ sessionToken: 'tok' } as any)).rejects.toBeInstanceOf(
            BadRequestException,
        );
    });

    it('throws when result missing', async () => {
        prisma.userResult.findUnique.mockResolvedValue(null);
        const scoring = { computeScores: jest.fn() } as unknown as ScoringService;
        const badges = { grantTestCompleted: jest.fn() } as unknown as BadgesService;
        const service = new ResultsService(prisma, scoring, badges);

        await expect(service.getBySessionId('s1')).rejects.toBeInstanceOf(NotFoundException);
    });
});
