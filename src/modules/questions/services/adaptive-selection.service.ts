import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PhaseType, RiasecType } from '@prisma/client';
import {
    MultiProfileQuestion,
    QuestionProfileWeight,
    RiasecScores,
    MultiProfileUtil,
} from '../../../common/utils/multi-profile.util';
import { AdaptiveUtil } from '../../../common/utils/adaptive.util';

export interface IntermediateProfileData {
    batchIndex: number;
    phaseType: PhaseType;
    profileData: RiasecScores;
    rawScores: RiasecScores;
    calculatedAt: Date;
}

export interface QuestionWithProfiles {
    id: number;
    riasecTypeId: RiasecType;
    profiles: QuestionProfileWeight[];
}

@Injectable()
export class AdaptiveSelectionService {
    private readonly logger = new Logger(AdaptiveSelectionService.name);

    constructor(private readonly prisma: PrismaService) {}

    async selectNextBatch(
        assessmentId: string,
        batchSize: number,
        currentProfile: RiasecScores,
        excludedQuestionIds: number[],
    ): Promise<number[]> {
        const assessment = await this.prisma.assessment.findUnique({
            where: { id: assessmentId },
            select: {
                test_version_id: true,
                current_phase: true,
                depth: true,
            },
        });

        if (!assessment) {
            throw new NotFoundException(`Assessment ${assessmentId} not found`);
        }

        const availableQuestions = await this.getMultiProfileQuestions(
            assessment.test_version_id,
            assessment.current_phase,
            excludedQuestionIds,
        );

        const selectedIds = AdaptiveUtil.selectTopQuestions(
            availableQuestions,
            currentProfile,
            batchSize,
        );

        return selectedIds;
    }

    async calculateIntermediateProfile(
        assessmentId: string,
        batchIndex: number,
    ): Promise<IntermediateProfileData> {
        const assessment = await this.prisma.assessment.findUnique({
            where: { id: assessmentId },
            include: {
                phase1_responses: {
                    include: {
                        question: {
                            select: {
                                id: true,
                                riasec_type_id: true,
                                profiles: {
                                    select: {
                                        riasec_type: true,
                                        weight: true,
                                    },
                                },
                            },
                        },
                    },
                },
                phase2_responses: {
                    include: {
                        question: {
                            select: {
                                id: true,
                                riasec_type_id: true,
                                profiles: {
                                    select: {
                                        riasec_type: true,
                                        weight: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!assessment) {
            throw new NotFoundException(`Assessment ${assessmentId} not found`);
        }

        let rawScores = MultiProfileUtil.emptyScores();

        for (const response of assessment.phase1_responses) {
            const profiles: QuestionProfileWeight[] =
                response.question.profiles.length > 0
                    ? response.question.profiles.map((p) => ({
                          riasecType: p.riasec_type,
                          weight: p.weight,
                      }))
                    : [
                          {
                              riasecType: response.question.riasec_type_id,
                              weight: 1.0,
                          },
                      ];

            rawScores = MultiProfileUtil.applyWeightedResponse(
                rawScores,
                profiles,
                response.response_value,
            );
        }

        for (const response of assessment.phase2_responses) {
            const profiles: QuestionProfileWeight[] =
                response.question.profiles.length > 0
                    ? response.question.profiles.map((p) => ({
                          riasecType: p.riasec_type,
                          weight: p.weight,
                      }))
                    : [
                          {
                              riasecType: response.question.riasec_type_id,
                              weight: 1.0,
                          },
                      ];

            rawScores = MultiProfileUtil.applyWeightedResponse(
                rawScores,
                profiles,
                response.response_value,
            );
        }

        const normalizedScores = MultiProfileUtil.normalizeScores(rawScores);

        const intermediateProfile = await this.prisma.intermediateProfile.upsert({
            where: {
                assessment_id_batch_index: {
                    assessment_id: assessmentId,
                    batch_index: batchIndex,
                },
            },
            create: {
                assessment_id: assessmentId,
                batch_index: batchIndex,
                phase_type: assessment.current_phase,
                profile_data: normalizedScores as any,
                raw_scores: rawScores as any,
            },
            update: {
                profile_data: normalizedScores as any,
                raw_scores: rawScores as any,
            },
        });

        return {
            batchIndex,
            phaseType: intermediateProfile.phase_type,
            profileData: normalizedScores,
            rawScores,
            calculatedAt: intermediateProfile.calculated_at,
        };
    }

    async getMultiProfileQuestions(
        testVersionId: number,
        phase: PhaseType,
        excludedIds: number[],
    ): Promise<MultiProfileQuestion[]> {
        if (phase === PhaseType.PHASE1) {
            const questions = await this.prisma.phase1Question.findMany({
                where: {
                    test_version_id: testVersionId,
                    is_active: true,
                    id: { notIn: excludedIds },
                },
                include: {
                    profiles: {
                        where: { phase: PhaseType.PHASE1 },
                        select: {
                            riasec_type: true,
                            weight: true,
                        },
                    },
                },
            });

            return questions.map((q) => ({
                id: q.id,
                profiles:
                    q.profiles.length > 0
                        ? q.profiles.map((p) => ({
                              riasecType: p.riasec_type,
                              weight: p.weight,
                          }))
                        : [{ riasecType: q.riasec_type_id, weight: 1.0 }],
            }));
        } else {
            const questions = await this.prisma.phase2Question.findMany({
                where: {
                    test_version_id: testVersionId,
                    is_active: true,
                    id: { notIn: excludedIds },
                },
                include: {
                    profiles: {
                        where: { phase: PhaseType.PHASE2 },
                        select: {
                            riasec_type: true,
                            weight: true,
                        },
                    },
                },
            });

            return questions.map((q) => ({
                id: q.id,
                profiles:
                    q.profiles.length > 0
                        ? q.profiles.map((p) => ({
                              riasecType: p.riasec_type,
                              weight: p.weight,
                          }))
                        : [{ riasecType: q.riasec_type_id, weight: 1.0 }],
            }));
        }
    }

    async scoreQuestionRelevance(
        questionId: number,
        phase: PhaseType,
        currentProfile: RiasecScores,
    ): Promise<number> {
        const question = await this.getQuestionWithProfiles(questionId, phase);

        if (!question) {
            return 0;
        }

        return MultiProfileUtil.scoreQuestionRelevance(question.profiles, currentProfile, true);
    }

    async getLatestIntermediateProfile(
        assessmentId: string,
    ): Promise<IntermediateProfileData | null> {
        const latestProfile = await this.prisma.intermediateProfile.findFirst({
            where: { assessment_id: assessmentId },
            orderBy: { batch_index: 'desc' },
        });

        if (!latestProfile) {
            return null;
        }

        return {
            batchIndex: latestProfile.batch_index,
            phaseType: latestProfile.phase_type,
            profileData: latestProfile.profile_data as unknown as RiasecScores,
            rawScores:
                (latestProfile.raw_scores as unknown as RiasecScores) ||
                MultiProfileUtil.emptyScores(),
            calculatedAt: latestProfile.calculated_at,
        };
    }

    private async getQuestionWithProfiles(
        questionId: number,
        phase: PhaseType,
    ): Promise<MultiProfileQuestion | null> {
        if (phase === PhaseType.PHASE1) {
            const question = await this.prisma.phase1Question.findUnique({
                where: { id: questionId },
                include: {
                    profiles: {
                        where: { phase: PhaseType.PHASE1 },
                        select: { riasec_type: true, weight: true },
                    },
                },
            });

            if (!question) return null;

            return {
                id: question.id,
                profiles:
                    question.profiles.length > 0
                        ? question.profiles.map((p) => ({
                              riasecType: p.riasec_type,
                              weight: p.weight,
                          }))
                        : [{ riasecType: question.riasec_type_id, weight: 1.0 }],
            };
        } else {
            const question = await this.prisma.phase2Question.findUnique({
                where: { id: questionId },
                include: {
                    profiles: {
                        where: { phase: PhaseType.PHASE2 },
                        select: { riasec_type: true, weight: true },
                    },
                },
            });

            if (!question) return null;

            return {
                id: question.id,
                profiles:
                    question.profiles.length > 0
                        ? question.profiles.map((p) => ({
                              riasecType: p.riasec_type,
                              weight: p.weight,
                          }))
                        : [{ riasecType: question.riasec_type_id, weight: 1.0 }],
            };
        }
    }
}
