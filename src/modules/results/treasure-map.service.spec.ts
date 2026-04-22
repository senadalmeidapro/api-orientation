import { TreasureMapService } from './treasure-map.service';
import type { ResultsService } from './results.service';
import type { StorageService } from '../media/storage.service';
import type { BadgesService } from '../badges/badges.service';
import { AssessmentStatus } from '@prisma/client';

const prisma = {
    session: { findUnique: jest.fn() },
    assessment: { findFirst: jest.fn() },
    assessmentResult: { findUnique: jest.fn() },
    assessmentCareerRecommendation: { findMany: jest.fn(), upsert: jest.fn() },
    career: { findMany: jest.fn() },
    treasureMap: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation((args: any[]) => Promise.all(args)),
} as any;

describe('TreasureMapService', () => {
    it('generates treasure map without pdf', async () => {
        prisma.session.findUnique.mockResolvedValue({ id: 1 });
        prisma.assessment.findFirst.mockResolvedValue({
            id: 'a1',
            sessionId: 1,
            status: AssessmentStatus.COMPLETED,
        });
        prisma.assessmentResult.findUnique.mockResolvedValue({
            id: 'r1',
            assessmentId: 'a1',
            phase1Code: 'R',
            phase2Code: 'RIA',
            phase1Scores: {},
            phase2Scores: {},
            sectionScores: {},
            consistencyLevel: 'FORTE',
            profileStrength: 'FORT',
            strengths: ['R', 'I'],
        });
        prisma.assessmentCareerRecommendation.findMany.mockResolvedValue([]);
        prisma.career.findMany.mockResolvedValue([{ id: 1, name: 'Tech', riasecCodes: ['R'] }]);
        prisma.assessmentCareerRecommendation.upsert.mockResolvedValue({ id: 1 });
        prisma.treasureMap.upsert.mockResolvedValue({ id: 'tm1', shareToken: 'share' });

        const results = { compute: jest.fn() } as unknown as ResultsService;
        const storage = { uploadBuffer: jest.fn() } as unknown as StorageService;
        const badges = { grantTreasureMap: jest.fn() } as unknown as BadgesService;

        const service = new TreasureMapService(prisma, results, storage, badges);
        const res = await service.generate('token', 'a1', false);

        expect(res.id).toBe('tm1');
    });
});
