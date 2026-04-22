import { ResultsService } from './results.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ScoringService } from '../scoring/scoring.service';
import type { BadgesService } from '../badges/badges.service';
import { AssessmentStatus, AssessmentType } from '@prisma/client';

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

    it('returns cached result when available', async () => {
        prisma.session.findUnique.mockResolvedValue({ id: 1 });
        prisma.assessment.findFirst.mockResolvedValue({
            id: 'a1',
            sessionId: 1,
            status: AssessmentStatus.COMPLETED,
            type: AssessmentType.PHASE1,
        });
        prisma.assessmentResult.findUnique.mockResolvedValue({ id: 'r1', assessmentId: 'a1' });

        const scoring = { computeScores: jest.fn() } as unknown as ScoringService;
        const badges = { grantTestCompleted: jest.fn() } as unknown as BadgesService;
        const service = new ResultsService(prisma, scoring, badges);

        const result = await service.compute({ sessionToken: 'tok' } as any);
        expect(result).toEqual({ id: 'r1', assessmentId: 'a1' });
        expect(scoring.computeScores).not.toHaveBeenCalled();
    });
});
