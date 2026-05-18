import { RecommendationsService } from './recommendations.service';
import type { ResultsService } from '../results/results.service';
import { AssessmentStatus, AssessmentType, Phase2Type, PhaseType } from '@prisma/client';

const prisma = {
  session: { findFirst: jest.fn() },
  assessment: { findFirst: jest.fn() },
  assessmentResult: { findUnique: jest.fn(), findMany: jest.fn() },
  career: { findMany: jest.fn() },
  assessmentCareerRecommendation: {
    upsert: jest.fn(),
    deleteMany: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn().mockImplementation((arg: unknown) => {
    if (typeof arg === 'function') {
      return (arg as (tx: typeof prisma) => Promise<unknown>)(prisma);
    }
    return Promise.all(arg as Array<Promise<unknown>>);
  }),
} as any;

describe('RecommendationsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.session.findFirst.mockResolvedValue({ id: 'session-1' });
    prisma.assessment.findFirst.mockResolvedValue({
      id: 'a1',
      sessionId: 'session-1',
      status: AssessmentStatus.COMPLETED,
      type: AssessmentType.FULL,
      testVersionId: 2,
      currentPhase: PhaseType.PHASE2,
      currentSection: Phase2Type.OCCUPATIONS,
    });
    prisma.assessmentResult.findUnique.mockResolvedValue({
      id: 'r1',
      phase2Code: 'RIA',
      phase2Scores: { R: 8, I: 5, A: 3 },
      phase1Scores: null,
      sectionScores: null,
    });
    prisma.assessmentResult.findMany.mockResolvedValue([]);
    prisma.assessmentCareerRecommendation.findMany.mockResolvedValue([]);
    prisma.assessmentCareerRecommendation.deleteMany.mockResolvedValue({ count: 0 });
    prisma.assessmentCareerRecommendation.upsert.mockImplementation(({ create }: any) =>
      Promise.resolve({
        id: `rec-${create.careerId}`,
        resultId: create.resultId,
        careerId: create.careerId,
        matchScore: create.matchScore,
        rankPosition: create.rankPosition,
      }),
    );
    prisma.career.findMany.mockResolvedValue([
      { id: 1, name: 'Tech', riasecCodes: ['R', 'I'], localDemand: 3, institutions: [] },
      { id: 2, name: 'Art', riasecCodes: ['A'], localDemand: 0, institutions: [] },
    ]);
  });

  it('computes recommendations', async () => {
    const resultsService = { compute: jest.fn() } as unknown as ResultsService;
    const cache = { get: jest.fn(async () => null), set: jest.fn() } as any;
    const service = new RecommendationsService(prisma, resultsService, cache);

    const res = await service.getCareerRecommendations({ limit: 1 }, 'token');

    expect(res.length).toBe(1);
    expect(res[0]!.career!.name).toBe('Tech');
    expect(prisma.assessmentCareerRecommendation.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ resultId: 'r1' }),
      }),
    );
    expect(prisma.assessmentCareerRecommendation.upsert).toHaveBeenCalled();
  });

  it('returns cached recommendations when available', async () => {
    prisma.assessmentCareerRecommendation.findMany.mockResolvedValue([
      { id: 'rec1', career: { id: 1, name: 'Cached' }, matchScore: 90, rankPosition: 1 },
    ]);

    const resultsService = { compute: jest.fn() } as unknown as ResultsService;
    const cache = { get: jest.fn(async () => null), set: jest.fn() } as any;
    const service = new RecommendationsService(prisma, resultsService, cache);

    const res = await service.getCareerRecommendations({ limit: 1 }, 'token');

    expect(res[0]!.career!.name).toBe('Cached');
    expect(prisma.career.findMany).not.toHaveBeenCalled();
  });

  it('bypasses recommendation fast-path when category is provided', async () => {
    prisma.assessmentCareerRecommendation.findMany.mockResolvedValue([
      {
        id: 'rec1',
        career: { id: 9, name: 'ShouldNotReturn' },
        matchScore: 99,
        rankPosition: 1,
      },
    ]);

    const resultsService = { compute: jest.fn() } as unknown as ResultsService;
    const cache = { get: jest.fn(async () => null), set: jest.fn() } as any;
    const service = new RecommendationsService(prisma, resultsService, cache);

    const res = await service.getCareerRecommendations({ category: 'NUMERIQUE' }, 'token');

    expect(res[0]!.career!.name).toBe('Tech');
    expect(prisma.career.findMany).toHaveBeenCalled();
    expect(prisma.assessmentCareerRecommendation.upsert).not.toHaveBeenCalled();
  });

  it('applies geolocation bonus using formation.university coordinates', async () => {
    prisma.career.findMany.mockResolvedValue([
      {
        id: 1,
        name: 'Near',
        riasecCodes: ['R'],
        localDemand: 0,
        institutions: [
          {
            formation: { university: { latitude: 6.5, longitude: 2.6 } },
          },
        ],
      },
      {
        id: 2,
        name: 'Far',
        riasecCodes: ['R'],
        localDemand: 0,
        institutions: [
          {
            formation: { university: { latitude: 0, longitude: 0 } },
          },
        ],
      },
    ]);

    const resultsService = { compute: jest.fn() } as unknown as ResultsService;
    const cache = { get: jest.fn(async () => null), set: jest.fn() } as any;
    const service = new RecommendationsService(prisma, resultsService, cache);

    const res = await service.getCareerRecommendations(
      {
        latitude: 6.5,
        longitude: 2.6,
        radiusKm: 5,
        limit: 2,
      },
      'token',
    );

    const typed = res as any[];
    expect(typed[0]!.career!.name).toBe('Near');
    expect(typed[0]!.matchScore).toBeGreaterThan(typed[1]!.matchScore);
  });

  it('re-sorts after advanced blending and constrains neighbors by assessment context', async () => {
    prisma.career.findMany.mockResolvedValue([
      { id: 1, name: 'R-first', riasecCodes: ['R'], localDemand: 1, institutions: [] },
      { id: 2, name: 'IA-second', riasecCodes: ['I', 'A'], localDemand: 0, institutions: [] },
    ]);
    prisma.assessmentResult.findMany.mockResolvedValue([
      {
        id: 'neighbor-1',
        phase2Scores: { R: 10, I: 6, A: 4 },
        phase1Scores: null,
        sectionScores: null,
      },
    ]);
    prisma.assessmentCareerRecommendation.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ resultId: 'neighbor-1', careerId: 2, matchScore: 100 }]);

    const resultsService = { compute: jest.fn() } as unknown as ResultsService;
    const cache = { get: jest.fn(async () => null), set: jest.fn() } as any;
    const service = new RecommendationsService(prisma, resultsService, cache);

    const res = await service.getCareerRecommendations({ advanced: true, limit: 2 }, 'token');

    expect(res[0]!.career!.id).toBe(2);
    expect(prisma.assessmentResult.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          assessment: expect.objectContaining({
            status: AssessmentStatus.COMPLETED,
            type: AssessmentType.FULL,
            testVersionId: 2,
            currentPhase: PhaseType.PHASE2,
            currentSection: Phase2Type.OCCUPATIONS,
          }),
        }),
      }),
    );
  });

  it('maps scored careers to deduplicated formations with universities', async () => {
    prisma.career.findMany.mockResolvedValue([
      {
        id: 1,
        name: 'Tech',
        riasecCodes: ['R', 'I'],
        localDemand: 3,
        institutions: [
          {
            isPrimary: true,
            formation: {
              id: 10,
              title: 'Licence Informatique',
              degree: 'Licence',
              duration: '3 ans',
              field: 'Informatique',
              costMin: 100000,
              costMax: 200000,
              universityId: 1,
              university: {
                id: 1,
                name: 'UAC',
                latitude: 6.5,
                longitude: 2.6,
                city: 'Cotonou',
                address: 'Calavi',
                website: 'https://uac.example',
              },
            },
          },
        ],
      },
      {
        id: 2,
        name: 'Design',
        riasecCodes: ['A'],
        localDemand: 0,
        institutions: [
          {
            isPrimary: false,
            formation: {
              id: 10,
              title: 'Licence Informatique',
              degree: 'Licence',
              duration: '3 ans',
              field: 'Informatique',
              costMin: 100000,
              costMax: 200000,
              universityId: 1,
              university: {
                id: 1,
                name: 'UAC',
                latitude: 6.5,
                longitude: 2.6,
                city: 'Cotonou',
                address: 'Calavi',
                website: 'https://uac.example',
              },
            },
          },
        ],
      },
    ]);

    const resultsService = { compute: jest.fn() } as unknown as ResultsService;
    const cache = { get: jest.fn(async () => null), set: jest.fn() } as any;
    const service = new RecommendationsService(prisma, resultsService, cache);

    const res = await service.getFormationRecommendations({ force: true, limit: 5 }, 'token');

    expect(res).toHaveLength(1);
    expect(res[0]!.formation.id).toBe(10);
    expect(res[0]!.university.name).toBe('UAC');
    expect(res[0]!.score).toBeGreaterThan(0);
  });

  it('filters formations without university and applies geolocation bonus on university coords', async () => {
    prisma.career.findMany.mockResolvedValue([
      {
        id: 1,
        name: 'NearCareer',
        riasecCodes: ['R'],
        localDemand: 0,
        institutions: [
          {
            isPrimary: true,
            formation: {
              id: 20,
              title: 'BTS Réseaux',
              degree: 'BTS',
              duration: '2 ans',
              field: null,
              costMin: null,
              costMax: null,
              universityId: 2,
              university: {
                id: 2,
                name: 'UNSTIM',
                latitude: 6.5,
                longitude: 2.6,
                city: 'Abomey',
                address: 'Campus',
                website: 'https://unstim.example',
              },
            },
          },
          {
            isPrimary: false,
            formation: {
              id: 21,
              title: 'Formation Sans Uni',
              degree: 'Certif',
              duration: '6 mois',
              field: null,
              costMin: null,
              costMax: null,
              universityId: null,
              university: null,
            },
          },
        ],
      },
    ]);

    const resultsService = { compute: jest.fn() } as unknown as ResultsService;
    const cache = { get: jest.fn(async () => null), set: jest.fn() } as any;
    const service = new RecommendationsService(prisma, resultsService, cache);

    const res = await service.getFormationRecommendations(
      {
        force: true,
        latitude: 6.5,
        longitude: 2.6,
        radiusKm: 50,
        limit: 5,
      },
      'token',
    );

    expect(res).toHaveLength(1);
    expect(res[0]!.formation.id).toBe(20);
  });
});
