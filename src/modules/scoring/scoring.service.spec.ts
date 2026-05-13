import { ScoringService } from './scoring.service';
import { ConsistencyLevel, Phase2Type, ProfileStrength } from '@prisma/client';

const prisma = {
  assessment: { findUnique: jest.fn() },
  phase1Question: { findMany: jest.fn() },
  phase2Question: { findMany: jest.fn() },
  phase1Response: { findMany: jest.fn() },
  phase2Response: { findMany: jest.fn() },
} as any;

describe('ScoringService', () => {
  it('computes codes', async () => {
    prisma.assessment.findUnique.mockResolvedValue({ test_version_id: 1 });
    prisma.phase1Question.findMany.mockResolvedValue([{ riasec_type_id: 'R' }]);
    prisma.phase2Question.findMany.mockResolvedValue([
      { riasec_type_id: 'I', phase2_type: Phase2Type.OCCUPATIONS, max_value: 1 },
    ]);
    prisma.phase1Response.findMany.mockResolvedValue([
      { response_value: 1, question: { riasec_type_id: 'R' } },
    ]);
    prisma.phase2Response.findMany.mockResolvedValue([
      { response_value: 1, question: { riasec_type_id: 'I', phase2_type: 'OCCUPATIONS' } },
    ]);

    const service = new ScoringService(prisma, {} as any);
    const res = await service.computeScores('a1', {
      phase1AssessmentId: 'a1',
      phase2Types: [Phase2Type.OCCUPATIONS],
    });

    expect(res.phase1Code?.startsWith('R')).toBe(true);
    expect(res.phase2Code?.startsWith('I')).toBe(true);
  });

  it('normalizes aptitude and computes consistency', async () => {
    prisma.assessment.findUnique.mockResolvedValue({ test_version_id: 1 });
    prisma.phase1Question.findMany.mockResolvedValue([
      { riasec_type_id: 'R' },
      { riasec_type_id: 'I' },
      { riasec_type_id: 'A' },
    ]);
    prisma.phase2Question.findMany.mockResolvedValue([
      { riasec_type_id: 'R', phase2_type: Phase2Type.APTITUDES, max_value: 3 },
      { riasec_type_id: 'I', phase2_type: Phase2Type.OCCUPATIONS, max_value: 1 },
    ]);
    prisma.phase1Response.findMany.mockResolvedValue([
      { response_value: 1, question: { riasec_type_id: 'R' } },
      { response_value: 1, question: { riasec_type_id: 'I' } },
      { response_value: 1, question: { riasec_type_id: 'A' } },
    ]);
    prisma.phase2Response.findMany.mockResolvedValue([
      { response_value: 3, question: { riasec_type_id: 'R', phase2_type: 'APTITUDES' } },
      { response_value: 1, question: { riasec_type_id: 'I', phase2_type: 'OCCUPATIONS' } },
    ]);

    const service = new ScoringService(prisma, {} as any);
    const res = await service.computeScores('a1', {
      phase1AssessmentId: 'a1',
      phase2Types: [Phase2Type.OCCUPATIONS, Phase2Type.APTITUDES],
    });

    expect(res.phase2NormalizedScores.R).toBe(100);
    expect(res.phase2Code?.startsWith('R')).toBe(true);
    expect(res.consistencyLevel).toBe(ConsistencyLevel.FORTE);
    expect(res.profileStrength).toBe(ProfileStrength.EXCEPTIONNEL);
  });
});
