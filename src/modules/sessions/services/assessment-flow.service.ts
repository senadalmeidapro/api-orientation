import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AssessmentStatus, AssessmentType, Phase2Type, PhaseType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAssessmentDto } from '../dto/create-assessment.dto';

const defaultDepth = 5;

@Injectable()
export class AssessmentFlowService {
  private readonly logger = new Logger(AssessmentFlowService.name);

  constructor(private readonly prisma: PrismaService) {}

  async resolveTestVersionId(explicitId?: number) {
    if (explicitId) {
      const exists = await this.prisma.testVersion.findUnique({
        where: { id: explicitId },
        select: { id: true },
      });
      if (!exists) throw new NotFoundException('TestVersion introuvable');
      return explicitId;
    }

    const active = await this.prisma.testVersion.findFirst({
      where: { isActive: true },
      orderBy: { id: 'desc' },
    });

    if (active) return active.id;

    const existing = await this.prisma.testVersion.findFirst({
      orderBy: { id: 'desc' },
    });

    if (existing) return existing.id;

    const created = await this.prisma.testVersion.create({
      data: {
        code: 'v1',
        name: 'Version 1',
        description: 'Version initiale du test RIASEC',
        isActive: true,
      },
    });

    return created.id;
  }

  resolvePhaseForType(type: AssessmentType) {
    if (type === AssessmentType.PHASE1 || type === AssessmentType.FULL) {
      return { phase: PhaseType.PHASE1, section: null };
    }
    if (type === AssessmentType.PHASE2_OCCUPATIONS) {
      return { phase: PhaseType.PHASE2, section: Phase2Type.OCCUPATIONS };
    }
    if (type === AssessmentType.PHASE2_APTITUDES) {
      return { phase: PhaseType.PHASE2, section: Phase2Type.APTITUDES };
    }
    return { phase: PhaseType.PHASE2, section: Phase2Type.PERSONALITY };
  }

  async createAssessment(sessionId: string, testVersionId: number, dto: CreateAssessmentDto) {
    const depth = dto.depth ?? defaultDepth;
    const { phase, section } = this.resolvePhaseForType(dto.type);

    return this.prisma.assessment.create({
      data: {
        sessionId,
        testVersionId,
        type: dto.type,
        depth,
        status: AssessmentStatus.IN_PROGRESS,
        currentPhase: phase,
        currentSection: section,
        currentStepIndex: 0,
        completionPercentage: 0,
      },
    });
  }

  async createAssessmentForSession(sessionToken: string, dto: CreateAssessmentDto) {
    const session = await this.prisma.session.findUnique({
      where: { sessionToken },
    });
    if (!session) throw new NotFoundException('Session introuvable');

    if (
      dto.type === AssessmentType.PHASE2_OCCUPATIONS ||
      dto.type === AssessmentType.PHASE2_APTITUDES ||
      dto.type === AssessmentType.PHASE2_PERSONALITY
    ) {
      const phase1Done = await this.prisma.assessment.findFirst({
        where: {
          sessionId: session.id,
          type: AssessmentType.PHASE1,
          status: AssessmentStatus.COMPLETED,
        },
        select: { id: true },
      });
      if (!phase1Done) {
        throw new NotFoundException("Le test d'amorce doit être complété avant un test spécifique");
      }
    }

    const testVersionId = await this.resolveTestVersionId(dto.testVersionId);
    return this.createAssessment(session.id, testVersionId, dto);
  }

  async listAssessments(sessionToken: string) {
    const session = await this.prisma.session.findUnique({
      where: { sessionToken },
      select: { id: true },
    });
    if (!session) throw new NotFoundException('Session introuvable');

    return this.prisma.assessment.findMany({
      where: { sessionId: session.id },
      orderBy: { startedAt: 'desc' },
      include: { result: true, treasureMap: true },
    });
  }
}
