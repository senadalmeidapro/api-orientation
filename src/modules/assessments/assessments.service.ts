import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AssessmentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AssessmentsService {
  private readonly logger = new Logger(AssessmentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getById(sessionToken: string, assessmentId: string) {
    const session = await this.prisma.session.findUnique({
      where: { sessionToken },
      select: { id: true },
    });
    if (!session) throw new NotFoundException('Session introuvable');

    const assessment = await this.prisma.assessment.findFirst({
      where: { id: assessmentId, sessionId: session.id },
      include: { result: true, treasureMap: true },
    });
    if (!assessment) throw new NotFoundException('Assessment introuvable');
    return assessment;
  }

  async getProgress(sessionToken: string, assessmentId: string) {
    const assessment = await this.getById(sessionToken, assessmentId);
    return {
      id: assessment.id,
      status: assessment.status,
      type: assessment.type,
      currentPhase: assessment.currentPhase,
      currentSection: assessment.currentSection,
      currentStepIndex: assessment.currentStepIndex,
      completionPercentage: assessment.completionPercentage,
      startedAt: assessment.startedAt,
      lastActivityAt: assessment.lastActivityAt,
      completedAt: assessment.completedAt,
    };
  }

  async abandon(sessionToken: string, assessmentId: string) {
    const assessment = await this.getById(sessionToken, assessmentId);
    if (assessment.status !== AssessmentStatus.IN_PROGRESS) {
      throw new BadRequestException('Assessment non actif');
    }

    return this.prisma.assessment.update({
      where: { id: assessment.id },
      data: {
        status: AssessmentStatus.ABANDONED,
        completedAt: new Date(),
      },
    });
  }
}
