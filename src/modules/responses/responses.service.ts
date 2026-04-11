import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePhase1ResponsesDto } from './dto/create-phase1-responses.dto';
import { CreatePhase2ResponsesDto } from './dto/create-phase2-responses.dto';
import { SubmitBatchResponsesDto } from './dto/submit-batch-responses.dto';
import {
    AssessmentStatus,
    AssessmentType,
    Phase2Type,
    PhaseType,
    RiasecType,
} from '@prisma/client';
import { BadgesService } from '../badges/badges.service';
import { resolveSessionAndAssessment } from '../../common/utils/assessment.util';
import { BehavioralAnalysisService } from './services/behavioral-analysis.service';
import { BatchManagementService } from '../sessions/services/batch-management.service';
import { AdaptiveSelectionService } from '../questions/services/adaptive-selection.service';

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
        private readonly behavioralService: BehavioralAnalysisService,
        private readonly batchService: BatchManagementService,
        private readonly adaptiveService: AdaptiveSelectionService,
    ) {}

    private emptyScores(): Record<RiasecType, number> {
        return { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    }

    private async invalidateResultIfExists(assessmentId: string) {
        const existing = await this.prisma.assessmentResult.findUnique({
            where: { assessment_id: assessmentId },
            select: { id: true },
        });
        if (!existing) return;

        await this.prisma.$transaction([
            this.prisma.assessmentCareerRecommendation.deleteMany({
                where: { result_id: existing.id },
            }),
            this.prisma.treasureMap.deleteMany({
                where: { assessment_id: assessmentId },
            }),
            this.prisma.assessmentResult.delete({
                where: { assessment_id: assessmentId },
            }),
            this.prisma.assessment.update({
                where: { id: assessmentId },
                data: {
                    status: AssessmentStatus.IN_PROGRESS,
                    completed_at: null,
                },
            }),
        ]);
    }

    private async ensurePhase1Prerequisite(sessionId: string) {
        const phase1Done = await this.prisma.assessment.findFirst({
            where: {
                session_id: sessionId,
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

    private buildCounts(items: Array<{ riasec_type_id: RiasecType }>) {
        const counts = this.emptyScores();
        for (const item of items) {
            counts[item.riasec_type_id] += 1;
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
            where: { is_active: true, test_version_id: testVersionId },
            select: { riasec_type_id: true },
        });
        const questionCounts = this.buildCounts(questions);
        const total = this.computeTargetTotal(questionCounts, depth);

        const responses = await this.prisma.phase1Response.findMany({
            where: { assessment_id: assessmentId },
            select: { question: { select: { riasec_type_id: true } } },
        });
        const answeredCounts = this.buildCounts(
            responses.map((r) => ({ riasec_type_id: r.question.riasec_type_id })),
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
            where: { is_active: true, test_version_id: testVersionId, phase2_type: section },
            select: { riasec_type_id: true },
        });
        const questionCounts = this.buildCounts(questions);
        const total = this.computeTargetTotal(questionCounts, depth);

        const responses = await this.prisma.phase2Response.findMany({
            where: { assessment_id: assessmentId, phase2_type: section },
            select: { question: { select: { riasec_type_id: true } } },
        });
        const answeredCounts = this.buildCounts(
            responses.map((r) => ({ riasec_type_id: r.question.riasec_type_id })),
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
                phase: PhaseType.PHASE1,
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
                test_version_id: assessment.test_version_id,
                is_active: true,
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
                        assessment_id_question_id: {
                            assessment_id: assessment.id,
                            question_id: r.questionId,
                        },
                    },
                    update: {
                        response_value: r.responseValue,
                        response_time_ms: r.responseTimeMs ?? undefined,
                    },
                    create: {
                        assessment_id: assessment.id,
                        question_id: r.questionId,
                        response_value: r.responseValue,
                        response_time_ms: r.responseTimeMs ?? undefined,
                    },
                }),
            ),
        );

        const depth = assessment.depth ?? DEFAULT_DEPTH;
        const progress = await this.computePhase1Progress(
            assessment.id,
            assessment.test_version_id,
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
                completed_at: phase1Completed && !isFull ? new Date() : undefined,
                current_phase: phase1Completed && isFull ? PhaseType.PHASE2 : PhaseType.PHASE1,
                current_section:
                    phase1Completed && isFull ? Phase2Type.OCCUPATIONS : assessment.current_section,
                completion_percentage: completionPercentage,
                current_stepIndex: progress.answered,
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
                phase: PhaseType.PHASE2,
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
                test_version_id: assessment.test_version_id,
                is_active: true,
            },
            select: { id: true, phase2_type: true, max_value: true },
        });

        if (questions.length !== questionIds.length) {
            throw new BadRequestException('Certaines questions Phase 2 sont invalides');
        }

        const questionMap = new Map(questions.map((q) => [q.id, q]));
        const sectionSet = new Set(questions.map((q) => q.phase2_type));
        if (sectionSet.size > 1) {
            throw new BadRequestException(
                'Les réponses Phase 2 doivent appartenir à une seule section',
            );
        }
        const sectionType = questions[0]?.phase2_type ?? null;

        if (!sectionType) {
            throw new BadRequestException('Section de phase 2 introuvable');
        }

        if (assessment.current_section && assessment.current_section !== sectionType) {
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
            if (q.phase2_type === Phase2Type.APTITUDES) {
                const maxVal = q.max_value ?? 3;
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
                        assessment_id_question_id: {
                            assessment_id: assessment.id,
                            question_id: r.questionId,
                        },
                    },
                    update: {
                        response_value: r.responseValue,
                        response_time_ms: r.responseTimeMs ?? undefined,
                    },
                    create: {
                        assessment_id: assessment.id,
                        phase2_type: sectionType,
                        question_id: r.questionId,
                        response_value: r.responseValue,
                        response_time_ms: r.responseTimeMs ?? undefined,
                    },
                }),
            ),
        );

        const depth = assessment.depth ?? DEFAULT_DEPTH;
        const sectionProgress = await this.computePhase2Progress(
            assessment.id,
            assessment.test_version_id,
            depth,
            sectionType,
        );
        const sectionCompleted =
            sectionProgress.total > 0 && sectionProgress.answered >= sectionProgress.total;

        const isFull = assessment.type === AssessmentType.FULL;
        let overallProgress = sectionProgress;
        let nextSection: Phase2Type | null = assessment.current_section ?? sectionType;
        if (isFull) {
            const totals = await Promise.all(
                PHASE2_ORDER.map((section) =>
                    this.computePhase2Progress(
                        assessment.id,
                        assessment.test_version_id,
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
                completed_at: phase2Completed ? new Date() : undefined,
                current_phase: PhaseType.PHASE2,
                current_section: isFull ? nextSection : sectionType,
                completion_percentage: completionPercentage,
                current_stepIndex: overallProgress.answered,
            },
        });

        if (phase2Completed || sectionCompleted) {
            await this.badges.grantPhase2Completed(session);
        }

        await this.invalidateResultIfExists(assessment.id);

        return { saved: dto.responses.length, phase2Completed };
    }

    /**
     * Nouvelle méthode adaptative : soumettre les réponses d'un lot complet
     * Déclenche l'analyse comportementale et le calcul du profil intermédiaire
     */
    async submitBatchResponses(dto: SubmitBatchResponsesDto) {
        const { session, assessment } = await resolveSessionAndAssessment(
            this.prisma,
            dto.sessionToken,
            {
                assessmentId: dto.assessmentId,
                requireInProgress: true,
            },
        );

        // Vérifier que le lot existe
        const batch = await this.batchService.getCurrentBatch(assessment.id);
        if (!batch || batch.batchIndex !== dto.batchIndex) {
            throw new BadRequestException(
                `Le lot ${dto.batchIndex} n'est pas le lot actuel ou n'existe pas`,
            );
        }

        // Valider que toutes les questions du lot sont présentes
        const batchQuestionIds = new Set(batch.questionIds);
        const responseQuestionIds = new Set(dto.responses.map((r) => r.questionId));
        const missingQuestions = [...batchQuestionIds].filter((id) => !responseQuestionIds.has(id));

        if (missingQuestions.length > 0) {
            throw new BadRequestException(
                `Réponses manquantes pour les questions: ${missingQuestions.join(', ')}`,
            );
        }

        // Sauvegarder les réponses avec métadonnées comportementales
        const savedResponses: string[] = [];

        if (assessment.current_phase === PhaseType.PHASE1) {
            for (const response of dto.responses) {
                const created = await this.prisma.phase1Response.upsert({
                    where: {
                        assessment_id_question_id: {
                            assessment_id: assessment.id,
                            question_id: response.questionId,
                        },
                    },
                    update: {
                        response_value: response.responseValue,
                        time_taken_ms: response.timeTakenMs,
                        change_count: response.changeCount ?? 0,
                        metadata: response.metadata ?? {},
                    },
                    create: {
                        assessment_id: assessment.id,
                        question_id: response.questionId,
                        response_value: response.responseValue,
                        time_taken_ms: response.timeTakenMs,
                        change_count: response.changeCount ?? 0,
                        metadata: response.metadata ?? {},
                    },
                });

                savedResponses.push(created.id);

                // Analyser le comportement si les données sont disponibles
                if (response.timeTakenMs && response.timeTakenMs > 0) {
                    await this.behavioralService.analyzeResponse(
                        assessment.id,
                        created.id,
                        response.timeTakenMs,
                        response.changeCount ?? 0,
                    );
                }
            }
        } else {
            const sectionType = assessment.current_section ?? Phase2Type.OCCUPATIONS;

            for (const response of dto.responses) {
                const created = await this.prisma.phase2Response.upsert({
                    where: {
                        assessment_id_question_id: {
                            assessment_id: assessment.id,
                            question_id: response.questionId,
                        },
                    },
                    update: {
                        response_value: response.responseValue,
                        time_taken_ms: response.timeTakenMs,
                        change_count: response.changeCount ?? 0,
                        metadata: response.metadata ?? {},
                    },
                    create: {
                        assessment_id: assessment.id,
                        question_id: response.questionId,
                        phase2_type: sectionType,
                        response_value: response.responseValue,
                        time_taken_ms: response.timeTakenMs,
                        change_count: response.changeCount ?? 0,
                        metadata: response.metadata ?? {},
                    },
                });

                savedResponses.push(created.id);

                // Analyser le comportement
                if (response.timeTakenMs && response.timeTakenMs > 0) {
                    await this.behavioralService.analyzeResponse(
                        assessment.id,
                        created.id,
                        response.timeTakenMs,
                        response.changeCount ?? 0,
                    );
                }
            }
        }

        // Marquer le lot comme complété
        await this.batchService.completeBatch(assessment.id, dto.batchIndex);

        // Calculer le profil intermédiaire
        const intermediateProfile = await this.adaptiveService.calculateIntermediateProfile(
            assessment.id,
            dto.batchIndex,
        );

        // Invalider les résultats existants
        await this.invalidateResultIfExists(assessment.id);

        // Vérifier si le test est complet
        const totalExpectedQuestions = assessment.depth * 6;
        const totalResponses =
            (await this.prisma.phase1Response.count({
                where: { assessment_id: assessment.id },
            })) +
            (await this.prisma.phase2Response.count({
                where: { assessment_id: assessment.id },
            }));

        const isComplete = totalResponses >= totalExpectedQuestions;
        const completionPercentage = Math.min(
            100,
            Math.round((totalResponses / totalExpectedQuestions) * 100),
        );

        // Mettre à jour l'assessment
        await this.prisma.assessment.update({
            where: { id: assessment.id },
            data: {
                status: isComplete ? AssessmentStatus.COMPLETED : AssessmentStatus.IN_PROGRESS,
                completed_at: isComplete ? new Date() : null,
                completion_percentage: completionPercentage,
            },
        });

        // Accorder des badges si applicable
        if (isComplete) {
            if (assessment.current_phase === PhaseType.PHASE1) {
                await this.badges.grantPhase1Completed(session);
            } else {
                await this.badges.grantPhase2Completed(session);
            }
        }

        return {
            saved: savedResponses.length,
            batchCompleted: true,
            intermediateProfile: {
                batchIndex: intermediateProfile.batchIndex,
                profileData: intermediateProfile.profileData,
                dominantCode: intermediateProfile.profileData
                    ? Object.entries(intermediateProfile.profileData)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 3)
                          .map((e) => e[0])
                          .join('')
                    : '',
            },
            testComplete: isComplete,
            completionPercentage,
        };
    }
}
