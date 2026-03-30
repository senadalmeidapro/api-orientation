import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePhase1ResponsesDto } from './dto/create-phase1-responses.dto';
import { CreatePhase2ResponsesDto } from './dto/create-phase2-responses.dto';
import {
    AssessmentStatus,
    AssessmentType,
    Phase2Type,
    PhaseType,
    RiasecType,
} from '@prisma/client';
import { BadgesService } from '../badges/badges.service';
import { resolveSessionAndAssessment } from '../../common/utils/assessment.util';

const DEFAULT_DEPTH = 5;
const PHASE2_ORDER: Phase2Type[] = [
    Phase2Type.OCCUPATIONS,
    Phase2Type.APTITUDES,
    Phase2Type.PERSONALITY,
];

@Injectable()
export class ResponsesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly badges: BadgesService,
    ) {}

    private emptyScores(): Record<RiasecType, number> {
        return { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    }

    private async invalidateResultIfExists(assessmentId: string) {
        const existing = await this.prisma.assessmentResult.findUnique({
            where: { assessmentId },
            select: { id: true },
        });
        if (!existing) return;

        await this.prisma.$transaction([
            this.prisma.assessmentCareerRecommendation.deleteMany({
                where: { resultId: existing.id },
            }),
            this.prisma.treasureMap.deleteMany({
                where: { assessmentId },
            }),
            this.prisma.assessmentResult.delete({
                where: { assessmentId },
            }),
            this.prisma.assessment.update({
                where: { id: assessmentId },
                data: {
                    status: AssessmentStatus.IN_PROGRESS,
                    completedAt: null,
                },
            }),
        ]);
    }

    private async ensurePhase1Prerequisite(sessionId: number) {
        const phase1Done = await this.prisma.assessment.findFirst({
            where: {
                sessionId,
                type: AssessmentType.PHASE1,
                status: AssessmentStatus.COMPLETED,
            },
            select: { id: true },
        });
        if (!phase1Done) {
            throw new BadRequestException(
                "Le test d'amorce doit être complété avant un test spécifique",
            );
        }
    }

    private capAnsweredByDepth(counts: Record<RiasecType, number>, depth: number) {
        return (Object.keys(counts) as RiasecType[]).reduce((sum, key) => {
            return sum + Math.min(counts[key] ?? 0, depth);
        }, 0);
    }

    private buildCounts(items: Array<{ riasecTypeId: RiasecType }>) {
        const counts = this.emptyScores();
        for (const item of items) {
            counts[item.riasecTypeId] += 1;
        }
        return counts;
    }

    private computeTargetTotal(counts: Record<RiasecType, number>, depth: number) {
        return (Object.keys(counts) as RiasecType[]).reduce((sum, key) => {
            return sum + Math.min(counts[key] ?? 0, depth);
        }, 0);
    }

    private async computePhase1Progress(
        assessmentId: string,
        testVersionId: number,
        depth: number,
    ) {
        const questions = await this.prisma.phase1Question.findMany({
            where: { isActive: true, testVersionId },
            select: { riasecTypeId: true },
        });
        const questionCounts = this.buildCounts(questions);
        const total = this.computeTargetTotal(questionCounts, depth);

        const responses = await this.prisma.phase1Response.findMany({
            where: { assessmentId },
            select: { question: { select: { riasecTypeId: true } } },
        });
        const answeredCounts = this.buildCounts(
            responses.map((r) => ({ riasecTypeId: r.question.riasecTypeId })),
        );
        const answered = this.capAnsweredByDepth(answeredCounts, depth);

        return { total, answered };
    }

    private async computePhase2Progress(
        assessmentId: string,
        testVersionId: number,
        depth: number,
        section: Phase2Type,
    ) {
        const questions = await this.prisma.phase2Question.findMany({
            where: { isActive: true, testVersionId, phase2Type: section },
            select: { riasecTypeId: true },
        });
        const questionCounts = this.buildCounts(questions);
        const total = this.computeTargetTotal(questionCounts, depth);

        const responses = await this.prisma.phase2Response.findMany({
            where: { assessmentId, phase2Type: section },
            select: { question: { select: { riasecTypeId: true } } },
        });
        const answeredCounts = this.buildCounts(
            responses.map((r) => ({ riasecTypeId: r.question.riasecTypeId })),
        );
        const answered = this.capAnsweredByDepth(answeredCounts, depth);

        return { total, answered };
    }

    async savePhase1(dto: CreatePhase1ResponsesDto) {
        const { session, assessment } = await resolveSessionAndAssessment(
            this.prisma,
            dto.sessionToken,
            {
                assessmentId: dto.assessmentId,
                phase: PhaseType.PHASE_1,
                requireInProgress: true,
            },
        );
        if (assessment.type !== AssessmentType.PHASE1 && assessment.type !== AssessmentType.FULL) {
            throw new BadRequestException('Ce test ne contient pas de phase 1');
        }

        const questionIds = dto.responses.map((r) => r.questionId);
        const questions = await this.prisma.phase1Question.findMany({
            where: {
                id: { in: questionIds },
                testVersionId: assessment.testVersionId,
                isActive: true,
            },
            select: { id: true },
        });

        if (questions.length !== questionIds.length) {
            throw new BadRequestException('Certaines questions Phase 1 sont invalides');
        }

        await this.prisma.$transaction(
            dto.responses.map((r) =>
                this.prisma.phase1Response.upsert({
                    where: {
                        assessmentId_questionId: {
                            assessmentId: assessment.id,
                            questionId: r.questionId,
                        },
                    },
                    update: {
                        responseValue: r.responseValue,
                        responseTimeMs: r.responseTimeMs ?? undefined,
                    },
                    create: {
                        assessmentId: assessment.id,
                        questionId: r.questionId,
                        responseValue: r.responseValue,
                        responseTimeMs: r.responseTimeMs ?? undefined,
                    },
                }),
            ),
        );

        const depth = assessment.depth ?? DEFAULT_DEPTH;
        const progress = await this.computePhase1Progress(
            assessment.id,
            assessment.testVersionId,
            depth,
        );
        const phase1Completed = progress.total > 0 && progress.answered >= progress.total;

        const isFull = assessment.type === AssessmentType.FULL;
        const completionPercentage = phase1Completed
            ? isFull
                ? 50
                : 100
            : isFull
              ? Math.round((progress.answered / Math.max(progress.total, 1)) * 50)
              : Math.round((progress.answered / Math.max(progress.total, 1)) * 100);

        await this.prisma.assessment.update({
            where: { id: assessment.id },
            data: {
                status:
                    phase1Completed && !isFull
                        ? AssessmentStatus.COMPLETED
                        : AssessmentStatus.IN_PROGRESS,
                completedAt: phase1Completed && !isFull ? new Date() : undefined,
                currentPhase: phase1Completed && isFull ? PhaseType.PHASE_2 : PhaseType.PHASE_1,
                currentSection:
                    phase1Completed && isFull ? Phase2Type.OCCUPATIONS : assessment.currentSection,
                completionPercentage,
                currentStepIndex: progress.answered,
            },
        });

        if (phase1Completed) {
            await this.badges.grantPhase1Completed(session);
        }

        await this.invalidateResultIfExists(assessment.id);

        return { saved: dto.responses.length, phase1Completed };
    }

    async savePhase2(dto: CreatePhase2ResponsesDto) {
        const { session, assessment } = await resolveSessionAndAssessment(
            this.prisma,
            dto.sessionToken,
            {
                assessmentId: dto.assessmentId,
                phase: PhaseType.PHASE_2,
                requireInProgress: true,
            },
        );
        if (assessment.type === AssessmentType.PHASE1) {
            throw new BadRequestException('La phase 2 est indisponible pour ce test');
        }
        if (
            assessment.type === AssessmentType.PHASE2_OCCUPATIONS ||
            assessment.type === AssessmentType.PHASE2_APTITUDES ||
            assessment.type === AssessmentType.PHASE2_PERSONALITY
        ) {
            await this.ensurePhase1Prerequisite(session.id);
        }

        const questionIds = dto.responses.map((r) => r.questionId);
        const questions = await this.prisma.phase2Question.findMany({
            where: {
                id: { in: questionIds },
                testVersionId: assessment.testVersionId,
                isActive: true,
            },
            select: { id: true, phase2Type: true, maxValue: true },
        });

        if (questions.length !== questionIds.length) {
            throw new BadRequestException('Certaines questions Phase 2 sont invalides');
        }

        const questionMap = new Map(questions.map((q) => [q.id, q]));
        const sectionSet = new Set(questions.map((q) => q.phase2Type));
        if (sectionSet.size > 1) {
            throw new BadRequestException(
                'Les réponses Phase 2 doivent appartenir à une seule section',
            );
        }
        const sectionType = questions[0]?.phase2Type ?? null;

        if (!sectionType) {
            throw new BadRequestException('Section de phase 2 introuvable');
        }

        if (assessment.currentSection && assessment.currentSection !== sectionType) {
            throw new BadRequestException('Section courante invalide pour cette requete');
        }

        if (
            assessment.type === AssessmentType.PHASE2_OCCUPATIONS &&
            sectionType !== Phase2Type.OCCUPATIONS
        ) {
            throw new BadRequestException('Section invalide pour ce test');
        }
        if (
            assessment.type === AssessmentType.PHASE2_APTITUDES &&
            sectionType !== Phase2Type.APTITUDES
        ) {
            throw new BadRequestException('Section invalide pour ce test');
        }
        if (
            assessment.type === AssessmentType.PHASE2_PERSONALITY &&
            sectionType !== Phase2Type.PERSONALITY
        ) {
            throw new BadRequestException('Section invalide pour ce test');
        }

        for (const r of dto.responses) {
            const q = questionMap.get(r.questionId);
            if (!q) throw new BadRequestException('Question Phase 2 introuvable');
            if (q.phase2Type === Phase2Type.APTITUDES) {
                const maxVal = q.maxValue ?? 3;
                if (r.responseValue < 1 || r.responseValue > maxVal) {
                    throw new BadRequestException('Valeur aptitude invalide');
                }
            } else if (r.responseValue < 0 || r.responseValue > 1) {
                throw new BadRequestException('Valeur réponse invalide');
            }
        }

        await this.prisma.$transaction(
            dto.responses.map((r) =>
                this.prisma.phase2Response.upsert({
                    where: {
                        assessmentId_questionId: {
                            assessmentId: assessment.id,
                            questionId: r.questionId,
                        },
                    },
                    update: {
                        responseValue: r.responseValue,
                        responseTimeMs: r.responseTimeMs ?? undefined,
                    },
                    create: {
                        assessmentId: assessment.id,
                        phase2Type: sectionType,
                        questionId: r.questionId,
                        responseValue: r.responseValue,
                        responseTimeMs: r.responseTimeMs ?? undefined,
                    },
                }),
            ),
        );

        const depth = assessment.depth ?? DEFAULT_DEPTH;
        const sectionProgress = await this.computePhase2Progress(
            assessment.id,
            assessment.testVersionId,
            depth,
            sectionType,
        );
        const sectionCompleted =
            sectionProgress.total > 0 && sectionProgress.answered >= sectionProgress.total;

        const isFull = assessment.type === AssessmentType.FULL;
        let overallProgress = sectionProgress;
        let nextSection: Phase2Type | null = assessment.currentSection ?? sectionType;
        if (isFull) {
            const totals = await Promise.all(
                PHASE2_ORDER.map((section) =>
                    this.computePhase2Progress(
                        assessment.id,
                        assessment.testVersionId,
                        depth,
                        section,
                    ),
                ),
            );
            const totalAll = totals.reduce((sum, item) => sum + item.total, 0);
            const answeredAll = totals.reduce((sum, item) => sum + item.answered, 0);
            overallProgress = { total: totalAll, answered: answeredAll };
            const nextIncomplete = PHASE2_ORDER.find(
                (section, idx) => totals[idx].total > 0 && totals[idx].answered < totals[idx].total,
            );
            nextSection = nextIncomplete ?? sectionType;
        }

        const phase2Completed =
            overallProgress.total > 0 && overallProgress.answered >= overallProgress.total;
        const completionPercentage = isFull
            ? phase2Completed
                ? 100
                : 50 +
                  Math.round((overallProgress.answered / Math.max(overallProgress.total, 1)) * 50)
            : Math.round((sectionProgress.answered / Math.max(sectionProgress.total, 1)) * 100);

        await this.prisma.assessment.update({
            where: { id: assessment.id },
            data: {
                status: phase2Completed ? AssessmentStatus.COMPLETED : AssessmentStatus.IN_PROGRESS,
                completedAt: phase2Completed ? new Date() : undefined,
                currentPhase: PhaseType.PHASE_2,
                currentSection: isFull ? nextSection : sectionType,
                completionPercentage,
                currentStepIndex: overallProgress.answered,
            },
        });

        if (phase2Completed || sectionCompleted) {
            await this.badges.grantPhase2Completed(session);
        }

        await this.invalidateResultIfExists(assessment.id);

        return { saved: dto.responses.length, phase2Completed };
    }
}
