import { ResultsService } from './results.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ScoringService } from '../scoring/scoring.service';
import { BadgesService } from '../badges/badges.service';
import { AssessmentStatus } from '@prisma/client';

const prisma = {
    session: { findUnique: jest.fn() },
    assessment: { findFirst: jest.fn() },
    assessmentResult: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
    },
} as any;

describe('ResultsService', () => {
    it('requires completed test before compute', async () => {
        prisma.session.findUnique.mockResolvedValue({ id: 1 });
        prisma.assessment.findFirst.mockResolvedValue({
            id: 'a1',
            sessionId: 1,
            status: AssessmentStatus.IN_PROGRESS,
        });

        const scoring = { computeScores: jest.fn() } as unknown as ScoringService;
        const badges = { grantTestCompleted: jest.fn() } as unknown as BadgesService;
        const service = new ResultsService(prisma, scoring, badges);

        await expect(service.compute({ sessionToken: 'tok' } as any)).rejects.toBeInstanceOf(
            BadRequestException,
        );
    });

    it('throws when result missing', async () => {
        prisma.assessmentResult.findFirst.mockResolvedValue(null);
        const scoring = { computeScores: jest.fn() } as unknown as ScoringService;
        const badges = { grantTestCompleted: jest.fn() } as unknown as BadgesService;
        const service = new ResultsService(prisma, scoring, badges);

        await expect(service.getBySessionId(1)).rejects.toBeInstanceOf(NotFoundException);
    });
});
