import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PhaseType, Prisma, RiasecType } from '@prisma/client';
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
                testVersionId: true,
                currentPhase: true,
                depth: true,
            },
        });

        if (!assessment) {
            throw new NotFoundException(`Assessment ${assessmentId} not found`);
        }

        const availableQuestions = await this.getMultiProfileQuestions(
            assessment.testVersionId,
            assessment.currentPhase,
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
                phase1Responses: {
                    include: {
                        question: {
                            select: {
                                id: true,
                                riasecTypeId: true,
                                profiles: {
                                    select: {
                                        riasecType: true,
                                        weight: true,
                                    },
                                },
                            },
                        },
                    },
                },
                phase2Responses: {
                    include: {
                        question: {
                            select: {
                                id: true,
                                riasecTypeId: true,
                                profiles: {
                                    select: {
                                        riasecType: true,
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

        for (const response of assessment.phase1Responses) {
            const profiles: QuestionProfileWeight[] =
                response.question.profiles.length > 0
                    ? response.question.profiles.map((p) => ({
                          riasecType: p.riasecType,
                          weight: p.weight,
                      }))
                    : [
                          {
                              riasecType: response.question.riasecTypeId,
                              weight: 1.0,
                          },
                      ];

            rawScores = MultiProfileUtil.applyWeightedResponse(
                rawScores,
                profiles,
                response.responseValue,
            );
        }

        for (const response of assessment.phase2Responses) {
            const profiles: QuestionProfileWeight[] =
                response.question.profiles.length > 0
                    ? response.question.profiles.map((p) => ({
                          riasecType: p.riasecType,
                          weight: p.weight,
                      }))
                    : [
                          {
                              riasecType: response.question.riasecTypeId,
                              weight: 1.0,
                          },
                      ];

            rawScores = MultiProfileUtil.applyWeightedResponse(
                rawScores,
                profiles,
                response.responseValue,
            );
        }

        const normalizedScores = MultiProfileUtil.normalizeScores(rawScores);
        const normalizedScoresJson = normalizedScores as unknown as Prisma.InputJsonValue;
        const rawScoresJson = rawScores as unknown as Prisma.InputJsonValue;

        const intermediateProfile = await this.prisma.intermediateProfile.upsert({
            where: {
                assessmentId_batchIndex: {
                    assessmentId,
                    batchIndex,
                },
            },
            create: {
                assessmentId,
                batchIndex,
                phaseType: assessment.currentPhase,
                profileData: normalizedScoresJson,
                rawScores: rawScoresJson,
            },
            update: {
                profileData: normalizedScoresJson,
                rawScores: rawScoresJson,
            },
        });

        return {
            batchIndex,
            phaseType: intermediateProfile.phaseType,
            profileData: normalizedScores,
            rawScores,
            calculatedAt: intermediateProfile.calculatedAt,
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
                    testVersionId,
                    isActive: true,
                    id: { notIn: excludedIds },
                },
                include: {
                    profiles: {
                        where: { phase: PhaseType.PHASE1 },
                        select: {
                            riasecType: true,
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
                              riasecType: p.riasecType,
                              weight: p.weight,
                          }))
                        : [{ riasecType: q.riasecTypeId, weight: 1.0 }],
            }));
        } else {
            const questions = await this.prisma.phase2Question.findMany({
                where: {
                    testVersionId,
                    isActive: true,
                    id: { notIn: excludedIds },
                },
                include: {
                    profiles: {
                        where: { phase: PhaseType.PHASE2 },
                        select: {
                            riasecType: true,
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
                              riasecType: p.riasecType,
                              weight: p.weight,
                          }))
                        : [{ riasecType: q.riasecTypeId, weight: 1.0 }],
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
            where: { assessmentId },
            orderBy: { batchIndex: 'desc' },
        });

        if (!latestProfile) {
            return null;
        }

        return {
            batchIndex: latestProfile.batchIndex,
            phaseType: latestProfile.phaseType,
            profileData: latestProfile.profileData as unknown as RiasecScores,
            rawScores:
                (latestProfile.rawScores as unknown as RiasecScores) ||
                MultiProfileUtil.emptyScores(),
            calculatedAt: latestProfile.calculatedAt,
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
                        select: { riasecType: true, weight: true },
                    },
                },
            });

            if (!question) return null;

            return {
                id: question.id,
                profiles:
                    question.profiles.length > 0
                        ? question.profiles.map((p) => ({
                              riasecType: p.riasecType,
                              weight: p.weight,
                          }))
                        : [{ riasecType: question.riasecTypeId, weight: 1.0 }],
            };
        } else {
            const question = await this.prisma.phase2Question.findUnique({
                where: { id: questionId },
                include: {
                    profiles: {
                        where: { phase: PhaseType.PHASE2 },
                        select: { riasecType: true, weight: true },
                    },
                },
            });

            if (!question) return null;

            return {
                id: question.id,
                profiles:
                    question.profiles.length > 0
                        ? question.profiles.map((p) => ({
                              riasecType: p.riasecType,
                              weight: p.weight,
                          }))
                        : [{ riasecType: question.riasecTypeId, weight: 1.0 }],
            };
        }
    }
}
