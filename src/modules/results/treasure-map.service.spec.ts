import { TreasureMapService } from './treasure-map.service';
import type { ResultsService } from './results.service';
import type { StorageService } from '../media/storage.service';
import type { BadgesService } from '../badges/badges.service';
import { TestStatus, TestType } from '@prisma/client';

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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates treasure map without pdf', async () => {
    prisma.session.findUnique.mockResolvedValue({ id: 1 });
    prisma.assessment.findFirst.mockResolvedValue({
      id: 'a1',
      sessionId: 1,
      type: TestType.FULL,
      status: TestStatus.COMPLETED,
      startedAt: new Date(),
      completedAt: new Date(),
      completionPercentage: 100,
    });
    prisma.assessmentResult.findUnique.mockResolvedValue({
      id: 'r1',
      assessmentId: 'a1',
      riasecCode: 'RIA',
      scoresByCategory: {
        GENERALE: {},
        totalRaw: {},
        normalized: {},
      },
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
    expect(storage.uploadBuffer).not.toHaveBeenCalled();
  });

  it('generates missing pdf when retrieving by share token', async () => {
    const mapData = {
      generatedAt: new Date().toISOString(),
      assessment: {
        id: 'a1',
        type: TestType.FULL,
        status: TestStatus.COMPLETED,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        completionPercentage: 100,
      },
      generalCode: 'RIA',
      specificCode: 'RIA',
      dominantCode: 'RIA',
      riasecSummary: [],
      generalScores: {},
      specificScores: {},
      sectionScores: {},
      sectionSummary: [],
      consistencyLevel: null,
      consistencyLabel: 'Non disponible',
      profileStrength: null,
      profileStrengthLabel: 'Non disponible',
      strengths: [],
      recommendations: [],
      nextSteps: [],
    };
    const map = { id: 'tm1', shareToken: 'share', pdfUrl: null, mapData };
    const updatedMap = { ...map, pdfUrl: 'storage/treasure-maps/tm1.pdf' };

    prisma.treasureMap.findUnique.mockResolvedValue(map);
    prisma.treasureMap.update.mockResolvedValue(updatedMap);

    const results = { compute: jest.fn() } as unknown as ResultsService;
    const storage = {
      uploadBuffer: jest.fn().mockResolvedValue('storage/treasure-maps/tm1.pdf'),
    } as unknown as StorageService;
    const badges = { grantTreasureMap: jest.fn() } as unknown as BadgesService;

    const service = new TreasureMapService(prisma, results, storage, badges);
    jest.spyOn(service as any, 'generatePdfBuffer').mockResolvedValue(Buffer.from('pdf'));

    const res = await service.getByShareToken('share');

    expect(storage.uploadBuffer).toHaveBeenCalledWith(Buffer.from('pdf'), 'application/pdf');
    expect(prisma.treasureMap.update).toHaveBeenCalledWith({
      where: {
        id: 'tm1',
      },
      data: {
        pdfUrl: 'storage/treasure-maps/tm1.pdf',
        viewCount: {
          increment: 1,
        },
        lastViewedAt: expect.any(Date),
      },
    });
    expect(res.pdfUrl).toBe('storage/treasure-maps/tm1.pdf');
  });
});
