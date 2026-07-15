import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TestStatus, TestType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAssessmentDto } from '../dto/create-assessment.dto';

const defaultDepth = 5;
const firstFullTestCategory = TestType.OCCUPATIONS;

@Injectable()
export class AssessmentFlowService {
  private readonly logger = new Logger(AssessmentFlowService.name);

  constructor(private readonly prisma: PrismaService) {}

  private getInitialCurrentCategory(type: TestType) {
    return type === TestType.FULL ? firstFullTestCategory : type;
  }

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

  async createAssessment(sessionId: string, testVersionId: number, dto: CreateAssessmentDto) {
    const depth = dto.depth ?? defaultDepth;

    return this.prisma.assessment.create({
      data: {
        sessionId,
        testVersionId,
        type: dto.type,
        currentCategory: this.getInitialCurrentCategory(dto.type),
        depth,
        status: TestStatus.IN_PROGRESS,
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
      dto.type === TestType.OCCUPATIONS ||
      dto.type === TestType.APTITUDES ||
      dto.type === TestType.PERSONALITY
    ) {
      const generalDone = await this.prisma.assessment.findFirst({
        where: {
          sessionId: session.id,
          type: TestType.GENERALE,
          status: TestStatus.COMPLETED,
        },
        select: { id: true },
      });
      if (!generalDone) {
        throw new NotFoundException('Le test générale doit être complété avant un test spécifique');
      }
    }

    const testVersionId = await this.resolveTestVersionId(dto.testVersionId);
    const depth = dto.depth ?? defaultDepth;

    const [, assessment] = await this.prisma.$transaction([
      this.prisma.assessment.updateMany({
        where: {
          sessionId: session.id,
          status: TestStatus.IN_PROGRESS,
        },
        data: {
          status: TestStatus.ABANDONED,
        },
      }),
      this.prisma.assessment.create({
        data: {
          sessionId: session.id,
          testVersionId,
          type: dto.type,
          currentCategory: this.getInitialCurrentCategory(dto.type),
          depth,
          status: TestStatus.IN_PROGRESS,
          currentStepIndex: 0,
          completionPercentage: 0,
        },
      }),
    ]);

    return assessment;
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
