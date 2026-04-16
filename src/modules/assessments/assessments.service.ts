import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AssessmentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AssessmentsService {
    private readonly logger = new Logger(AssessmentsService.name);

    constructor(private readonly prisma: PrismaService) {}

    async getById(sessionToken: string, assessmentId: string) {
        const session = await this.prisma.session.findUnique({
            where: { session_token: sessionToken },
            select: { id: true },
        });
        if (!session) throw new NotFoundException('Session introuvable');

        const assessment = await this.prisma.assessment.findFirst({
            where: { id: assessmentId, session_id: session.id },
            include: { result: true, treasure_map: true },
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
            currentPhase: assessment.current_phase,
            currentSection: assessment.current_section,
            currentStepIndex: assessment.current_stepIndex,
            completionPercentage: assessment.completion_percentage,
            startedAt: assessment.started_at,
            lastActivityAt: assessment.lastActivity_at,
            completedAt: assessment.completed_at,
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
                completed_at: new Date(),
            },
        });
    }
}
