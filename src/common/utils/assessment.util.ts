import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AssessmentStatus, type Phase2Type, type PhaseType } from '@prisma/client';
import type { PrismaService } from '../../prisma/prisma.service';

type ResolveAssessmentOptions = {
  assessmentId?: string;
  phase?: PhaseType;
  section?: Phase2Type;
  requireInProgress?: boolean;
};

export async function resolveSessionAndAssessment(
  prisma: PrismaService,
  sessionToken: string,
  options: ResolveAssessmentOptions = {},
) {
  const session = await prisma.session.findUnique({
    where: { sessionToken: sessionToken },
    include: { user: true },
  });
  if (!session) throw new NotFoundException('Session introuvable');

  const statusFilter = options.requireInProgress ? AssessmentStatus.IN_PROGRESS : undefined;
  const assessment = options.assessmentId
    ? await prisma.assessment.findFirst({
        where: {
          id: options.assessmentId,
          sessionId: session.id,
          ...(statusFilter ? { status: statusFilter } : {}),
        },
      })
    : await prisma.assessment.findFirst({
        where: {
          sessionId: session.id,
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(options.phase ? { currentPhase: options.phase } : {}),
        },
        orderBy: { startedAt: 'desc' },
      });

  if (!assessment) {
    throw new NotFoundException('Aucun test actif pour cette session');
  }

  if (options.phase && assessment.currentPhase !== options.phase) {
    throw new BadRequestException('Phase courante invalide pour cette requete');
  }
  if (
    options.section &&
    assessment.currentSection &&
    assessment.currentSection !== options.section
  ) {
    throw new BadRequestException('Section courante invalide pour cette requete');
  }

  return { session, assessment };
}
