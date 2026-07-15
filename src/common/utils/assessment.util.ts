import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TestStatus, type TestType } from '@prisma/client';
import type { PrismaService } from '../../prisma/prisma.service';

type ResolveAssessmentOptions = {
  assessmentId?: string;
  currentCategory?: TestType;
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

  const statusFilter = options.requireInProgress ? TestStatus.IN_PROGRESS : undefined;
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
          ...(options.currentCategory ? { currentCategory: options.currentCategory } : {}),
        },
        orderBy: { startedAt: 'desc' },
      });

  if (!assessment) {
    throw new NotFoundException('Aucun test actif pour cette session');
  }

  if (options.currentCategory && assessment.currentCategory !== options.currentCategory) {
    throw new BadRequestException(
      `Catégorie courante invalide pour cette requete ${options.currentCategory} dd ${assessment.currentCategory}`,
    );
  }
  if (
    options.currentCategory &&
    assessment.currentCategory &&
    assessment.currentCategory !== options.currentCategory
  ) {
    throw new BadRequestException('Section courante invalide pour cette requete');
  }

  return { session, assessment };
}
