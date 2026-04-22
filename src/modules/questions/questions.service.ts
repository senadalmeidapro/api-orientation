import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Phase2Type, PhaseType, Prisma, RiasecType } from '@prisma/client';
import { resolveSessionAndAssessment } from '../../common/utils/assessment.util';
import { CacheService } from '../../common/cache/cache.service';
import { AdaptiveSelectionService } from './services/adaptive-selection.service';
import { BatchManagementService } from '../sessions/services/batch-management.service';
import { MultiProfileUtil } from '../../common/utils/multi-profile.util';
import { GetPhase1QuestionsDto, GetPhase2QuestionsDto, GetNextBatchDto } from './dto';

const defaultDepth = 5;

type Phase1QuestionWithTranslations = Prisma.Phase1QuestionGetPayload<{
    include: { translations: true };
}>;

type Phase2QuestionWithTranslations = Prisma.Phase2QuestionGetPayload<{
    include: { translations: true };
}>;

@Injectable()
export class QuestionsService {
    private readonly logger = new Logger(QuestionsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: CacheService,
        private readonly adaptive: AdaptiveSelectionService,
        private readonly batch: BatchManagementService,
    ) {}

    private async resolveLanguageId(code?: string) {
        if (!code) return null;
        const lang = await this.prisma.language.findUnique({ where: { code } });
        return lang?.id ?? null;
    }

    private emptyScores(): Record<RiasecType, number> {
        return { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    }

    private applyDepthFilter<
        T extends { id: number; riasecTypeId: RiasecType; displayOrder: number },
    >(
        questions: T[],
        answered: Set<number>,
        answeredCounts: Record<RiasecType, number>,
        depth: number,
    ) {
        const remaining: Record<RiasecType, number> = this.emptyScores();
        for (const key of Object.keys(remaining) as RiasecType[]) {
            remaining[key] = Math.max(0, depth - (answeredCounts[key] ?? 0));
        }

        const selected: T[] = [];
        for (const question of questions) {
            if (answered.has(question.id)) continue;
            const count = remaining[question.riasecTypeId] ?? 0;
            if (count <= 0) continue;
            selected.push(question);
            remaining[question.riasecTypeId] = count - 1;
        }
        return selected.sort((a, b) => a.displayOrder - b.displayOrder);
    }

    async getPhase1Questions(dto: GetPhase1QuestionsDto) {
        const { assessment } = await resolveSessionAndAssessment(this.prisma, dto.sessionToken, {
            ...(dto.assessmentId !== undefined ? { assessmentId: dto.assessmentId } : {}),
            phase: PhaseType.PHASE1,
            requireInProgress: true,
        });
        const languageId = await this.resolveLanguageId(dto.lang);

        const responses = await this.prisma.phase1Response.findMany({
            where: { assessmentId: assessment.id },
            select: { questionId: true, question: { select: { riasecTypeId: true } } },
        });
        const answeredIds = new Set(responses.map((r) => r.questionId));
        const answeredCounts = this.emptyScores();
        for (const response of responses) {
            answeredCounts[response.question.riasecTypeId] += 1;
        }

        const cacheKey = `questions:phase1:${assessment.testVersionId}:${languageId ?? 'base'}`;
        let questions = await this.cache.get<Phase1QuestionWithTranslations[]>(cacheKey);
        if (!questions) {
            questions = await this.prisma.phase1Question.findMany({
                where: { isActive: true, testVersionId: assessment.testVersionId },
                orderBy: { displayOrder: 'asc' },
                include: {
                    translations: languageId
                        ? {
                              where: { languageId },
                              take: 1,
                          }
                        : false,
                },
            });
            await this.cache.set(cacheKey, questions, 300);
        }

        const depth = assessment.depth ?? defaultDepth;
        const filtered = this.applyDepthFilter(questions, answeredIds, answeredCounts, depth);
        const limited = dto.take ? filtered.slice(0, dto.take) : filtered;

        return limited.map((q) => {
            const t = q.translations?.[0];
            return {
                id: q.id,
                riasecType: q.riasecTypeId,
                text: t?.questionText ?? q.questionText,
                short: t?.questionShort ?? q.questionShort,
                illustrationUrl: q.illustrationUrl,
                pointsValue: q.pointsValue, // Wait! in schema: pointsValue
                displayOrder: q.displayOrder,
            };
        });
    }

    async getPhase2Questions(dto: GetPhase2QuestionsDto) {
        const { assessment } = await resolveSessionAndAssessment(this.prisma, dto.sessionToken, {
            ...(dto.assessmentId !== undefined ? { assessmentId: dto.assessmentId } : {}),
            phase: PhaseType.PHASE2,
            requireInProgress: true,
        });

        const targetSection = dto.section ?? assessment.currentSection ?? Phase2Type.OCCUPATIONS;
        if (assessment.currentSection && assessment.currentSection !== targetSection) {
            throw new BadRequestException('Section courante invalide pour cette requete');
        }
        const languageId = await this.resolveLanguageId(dto.lang);

        const responses = await this.prisma.phase2Response.findMany({
            where: { assessmentId: assessment.id, phase2Type: targetSection },
            select: { questionId: true, question: { select: { riasecTypeId: true } } },
        });
        const answeredIds = new Set(responses.map((r) => r.questionId));
        const answeredCounts = this.emptyScores();
        for (const response of responses) {
            answeredCounts[response.question.riasecTypeId] += 1;
        }

        const cacheKey = `questions:phase2:${assessment.testVersionId}:${targetSection}:${
            languageId ?? 'base'
        }`;
        let questions = await this.cache.get<Phase2QuestionWithTranslations[]>(cacheKey);
        if (!questions) {
            questions = await this.prisma.phase2Question.findMany({
                where: {
                    isActive: true,
                    testVersionId: assessment.testVersionId,
                    phase2Type: targetSection,
                },
                orderBy: { displayOrder: 'asc' },
                include: {
                    translations: languageId
                        ? {
                              where: { languageId },
                              take: 1,
                          }
                        : false,
                },
            });
            await this.cache.set(cacheKey, questions, 300);
        }

        const depth = assessment.depth ?? defaultDepth;
        const filtered = this.applyDepthFilter(questions, answeredIds, answeredCounts, depth);
        const limited = dto.take ? filtered.slice(0, dto.take) : filtered;

        return limited.map((q) => {
            const t = q.translations?.[0];
            return {
                id: q.id,
                riasecType: q.riasecTypeId,
                sectionType: q.phase2Type,
                text: t?.questionText ?? q.questionText,
                subtext: t?.questionSubtext ?? q.questionSubtext,
                mediaUrl: q.mediaUrl,
                minValue: q.minValue,
                maxValue: q.maxValue,
                valueLabels: q.valueLabels,
                pointsValue: q.pointsValue,
                displayOrder: q.displayOrder,
            };
        });
    }

    createPhase1Question() {
        throw new BadRequestException('Creation de questions desactivee');
    }

    updatePhase1Question() {
        throw new BadRequestException('Mise a jour de questions desactivee');
    }

    createPhase2Question() {
        throw new BadRequestException('Creation de questions desactivee');
    }

    updatePhase2Question() {
        throw new BadRequestException('Mise a jour de questions desactivee');
    }

    /**
     * Nouvelle méthode adaptative : récupère le lot suivant de questions
     * basé sur le profil intermédiaire de l'utilisateur
     */
    async getNextBatchQuestions(dto: GetNextBatchDto) {
        const { assessment } = await resolveSessionAndAssessment(this.prisma, dto.sessionToken, {
            ...(dto.assessmentId !== undefined ? { assessmentId: dto.assessmentId } : {}),
            requireInProgress: true,
        });

        const batchSize = dto.batchSize ?? assessment.batchSize ?? 5;

        // Récupérer le profil intermédiaire actuel
        const latestProfile = await this.adaptive.getLatestIntermediateProfile(assessment.id);

        // Si pas de profil, utiliser un profil vide (premier lot)
        const currentProfile = latestProfile
            ? latestProfile.profileData
            : MultiProfileUtil.emptyScores();

        // Récupérer les questions déjà posées
        const askedQuestions = await this.batch.getAllAskedQuestions(assessment.id);

        // Sélectionner le lot suivant avec la logique adaptative
        const selectedQuestionIds = await this.adaptive.selectNextBatch(
            assessment.id,
            batchSize,
            currentProfile,
            askedQuestions,
        );

        // Démarrer le nouveau lot
        await this.batch.startNewBatch(assessment.id, selectedQuestionIds, assessment.currentPhase);

        // Récupérer les détails des questions sélectionnées
        const languageId = await this.resolveLanguageId(dto.lang);

        if (assessment.currentPhase === PhaseType.PHASE1) {
            const questions = await this.prisma.phase1Question.findMany({
                where: {
                    id: { in: selectedQuestionIds },
                    isActive: true,
                },
                include: {
                    translations: languageId
                        ? {
                              where: { languageId: languageId },
                              take: 1,
                          }
                        : false,
                    profiles: {
                        where: { phase: PhaseType.PHASE1 },
                        select: {
                            riasecType: true,
                            weight: true,
                        },
                    },
                },
                orderBy: { displayOrder: 'asc' },
            });

            return questions.map((q) => {
                const t = q.translations?.[0];
                return {
                    id: q.id,
                    riasecType: q.riasecTypeId,
                    text: t?.questionText ?? q.questionText,
                    short: t?.questionShort ?? q.questionShort,
                    illustrationUrl: q.illustrationUrl,
                    pointsValue: q.pointsValue,
                    displayOrder: q.displayOrder,
                    profiles: q.profiles.map((p) => ({
                        riasecType: p.riasecType,
                        weight: p.weight,
                    })),
                };
            });
        } else {
            const currentSection = assessment.currentSection ?? Phase2Type.OCCUPATIONS;
            const questions = await this.prisma.phase2Question.findMany({
                where: {
                    id: { in: selectedQuestionIds },
                    isActive: true,
                    phase2Type: currentSection,
                },
                include: {
                    translations: languageId
                        ? {
                              where: { languageId: languageId },
                              take: 1,
                          }
                        : false,
                    profiles: {
                        where: { phase: PhaseType.PHASE2 },
                        select: {
                            riasecType: true,
                            weight: true,
                        },
                    },
                },
                orderBy: { displayOrder: 'asc' },
            });

            return questions.map((q) => {
                const t = q.translations?.[0];
                return {
                    id: q.id,
                    riasecType: q.riasecTypeId,
                    sectionType: q.phase2Type,
                    text: t?.questionText ?? q.questionText,
                    subtext: t?.questionSubtext ?? q.questionSubtext,
                    mediaUrl: q.mediaUrl,
                    minValue: q.minValue,
                    maxValue: q.maxValue,
                    valueLabels: q.valueLabels,
                    pointsValue: q.pointsValue,
                    displayOrder: q.displayOrder,
                    profiles: q.profiles.map((p) => ({
                        riasecType: p.riasecType,
                        weight: p.weight,
                    })),
                };
            });
        }
    }
}
