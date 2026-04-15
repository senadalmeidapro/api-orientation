import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AssessmentStatus, Phase2Type, PhaseType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

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
        where: { session_token: sessionToken },
        include: { user: true },
    });
    if (!session) throw new NotFoundException('Session introuvable');

    const statusFilter = options.requireInProgress ? AssessmentStatus.IN_PROGRESS : undefined;
    const assessment = options.assessmentId
        ? await prisma.assessment.findFirst({
              where: {
                  id: options.assessmentId,
                  session_id: session.id,
                  status: statusFilter ?? undefined,
              },
          })
        : await prisma.assessment.findFirst({
              where: {
                  session_id: session.id,
                  status: statusFilter ?? undefined,
                  current_phase: options.phase ?? undefined,
              },
              orderBy: { started_at: 'desc' },
          });

    if (!assessment) {
        throw new NotFoundException('Aucun test actif pour cette session');
    }

    if (options.phase && assessment.current_phase !== options.phase) {
        throw new BadRequestException('Phase courante invalide pour cette requete');
    }
    if (
        options.section &&
        assessment.current_section &&
        assessment.current_section !== options.section
    ) {
        throw new BadRequestException('Section courante invalide pour cette requete');
    }

    return { session, assessment };
}
