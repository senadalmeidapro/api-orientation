import { TreasureMapService } from './treasure-map.service';
import { ResultsService } from './results.service';
import { StorageService } from '../media/storage.service';
import { BadgesService } from '../badges/badges.service';

const prisma = {
    userTestSession: { findUnique: jest.fn() },
    userResult: { findUnique: jest.fn() },
    userCareerRecommendation: { findMany: jest.fn(), upsert: jest.fn() },
    career: { findMany: jest.fn() },
    treasureMap: { upsert: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    $transaction: jest.fn().mockImplementation((args: any[]) => Promise.all(args)),
} as any;

describe('TreasureMapService', () => {
    it('generates treasure map without pdf', async () => {
        prisma.userTestSession.findUnique.mockResolvedValue({ id: 's1', shareToken: 'share' });
        prisma.userResult.findUnique.mockResolvedValue({
            id: 1,
            phase1Code: 'R',
            phase2Code: 'RIA',
            phase1Scores: {},
            phase2Scores: {},
            sectionScores: {},
            consistencyLevel: 'FORTE',
            profileStrength: 'FORT',
            strengths: ['R', 'I'],
        });
        prisma.userCareerRecommendation.findMany.mockResolvedValue([]);
        prisma.career.findMany.mockResolvedValue([{ id: 1, name: 'Tech', riasecCodes: ['R'] }]);
        prisma.userCareerRecommendation.upsert.mockResolvedValue({ id: 1 });
        prisma.treasureMap.upsert.mockResolvedValue({ id: 1, shareToken: 'share' });

        const results = { compute: jest.fn() } as unknown as ResultsService;
        const storage = { uploadBuffer: jest.fn() } as unknown as StorageService;
        const badges = { grantTreasureMap: jest.fn() } as unknown as BadgesService;

        const service = new TreasureMapService(prisma, results, storage, badges);
        const res = await service.generate('token', false);

        expect(res.id).toBe(1);
    });
});
