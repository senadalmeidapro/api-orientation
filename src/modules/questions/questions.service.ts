import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Phase2Type, PhaseType, RiasecType } from '@prisma/client';
import { resolveSessionAndAssessment } from '../../common/utils/assessment.util';
import { CacheService } from '../../common/cache/cache.service';
import { AdaptiveSelectionService } from './services/adaptive-selection.service';
import { BatchManagementService } from '../sessions/services/batch-management.service';
import { MultiProfileUtil } from '../../common/utils/multi-profile.util';
import { GetPhase1QuestionsDto, GetPhase2QuestionsDto, GetNextBatchDto } from './dto';

const DEFAULT_DEPTH = 5;

@Injectable()
export class QuestionsService {
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
        T extends { id: number; riasec_type_id: RiasecType; display_order: number },
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
            const count = remaining[question.riasec_type_id] ?? 0;
            if (count <= 0) continue;
            selected.push(question);
            remaining[question.riasec_type_id] = count - 1;
        }
        return selected.sort((a, b) => a.display_order - b.display_order);
    }

    async getPhase1Questions(dto: GetPhase1QuestionsDto) {
        const { assessment } = await resolveSessionAndAssessment(this.prisma, dto.sessionToken, {
            assessmentId: dto.assessmentId,
            phase: PhaseType.PHASE1,
            requireInProgress: true,
        });
        const languageId = await this.resolveLanguageId(dto.lang);

        const responses = await this.prisma.phase1Response.findMany({
            where: { assessment_id: assessment.id },
            select: { question_id: true, question: { select: { riasec_type_id: true } } },
        });
        const answeredIds = new Set(responses.map((r) => r.question_id));
        const answeredCounts = this.emptyScores();
        for (const response of responses) {
            answeredCounts[response.question.riasec_type_id] += 1;
        }

        const cacheKey = `questions:phase1:${assessment.test_version_id}:${languageId ?? 'base'}`;
        let questions = await this.cache.get<any[]>(cacheKey);
        if (!questions) {
            questions = await this.prisma.phase1Question.findMany({
                where: { is_active: true, test_version_id: assessment.test_version_id },
                orderBy: { display_order: 'asc' },
                include: {
                    translations: languageId
                        ? {
                              where: { language_id: languageId },
                              take: 1,
                          }
                        : false,
                },
            });
            await this.cache.set(cacheKey, questions, 300);
        }

        const depth = assessment.depth ?? DEFAULT_DEPTH;
        const filtered = this.applyDepthFilter(questions, answeredIds, answeredCounts, depth);
        const limited = dto.take ? filtered.slice(0, dto.take) : filtered;

        return limited.map((q) => {
            const t = q.translations?.[0];
            return {
                id: q.id,
                riasecType: q.riasec_type_id,
                text: t?.question_text ?? q.question_text,
                short: t?.question_short ?? q.question_short,
                illustrationUrl: q.illustration_url,
                pointsValue: q.pointsValue, // Wait! in schema: pointsValue
                displayOrder: q.display_order,
            };
        });
    }

    async getPhase2Questions(dto: GetPhase2QuestionsDto) {
        const { assessment } = await resolveSessionAndAssessment(this.prisma, dto.sessionToken, {
            assessmentId: dto.assessmentId,
            phase: PhaseType.PHASE2,
            requireInProgress: true,
        });

        const targetSection = dto.section ?? assessment.current_section ?? Phase2Type.OCCUPATIONS;
        if (assessment.current_section && assessment.current_section !== targetSection) {
            throw new BadRequestException('Section courante invalide pour cette requete');
        }
        const languageId = await this.resolveLanguageId(dto.lang);

        const responses = await this.prisma.phase2Response.findMany({
            where: { assessment_id: assessment.id, phase2_type: targetSection },
            select: { question_id: true, question: { select: { riasec_type_id: true } } },
        });
        const answeredIds = new Set(responses.map((r) => r.question_id));
        const answeredCounts = this.emptyScores();
        for (const response of responses) {
            answeredCounts[response.question.riasec_type_id] += 1;
        }

        const cacheKey = `questions:phase2:${assessment.test_version_id}:${targetSection}:${
            languageId ?? 'base'
        }`;
        let questions = await this.cache.get<any[]>(cacheKey);
        if (!questions) {
            questions = await this.prisma.phase2Question.findMany({
                where: {
                    is_active: true,
                    test_version_id: assessment.test_version_id,
                    phase2_type: targetSection,
                },
                orderBy: { display_order: 'asc' },
                include: {
                    translations: languageId
                        ? {
                              where: { language_id: languageId },
                              take: 1,
                          }
                        : false,
                },
            });
            await this.cache.set(cacheKey, questions, 300);
        }

        const depth = assessment.depth ?? DEFAULT_DEPTH;
        const filtered = this.applyDepthFilter(questions, answeredIds, answeredCounts, depth);
        const limited = dto.take ? filtered.slice(0, dto.take) : filtered;

        return limited.map((q) => {
            const t = q.translations?.[0];
            return {
                id: q.id,
                riasecType: q.riasec_type_id,
                sectionType: q.phase2_type,
                text: t?.question_text ?? q.question_text,
                subtext: t?.question_subtext ?? q.question_subtext,
                mediaUrl: q.media_url,
                minValue: q.min_value,
                maxValue: q.max_value,
                valueLabels: q.value_labels,
                pointsValue: q.points_value,
                displayOrder: q.display_order,
            };
        });
    }

    async createPhase1Question() {
        throw new BadRequestException('Creation de questions desactivee');
    }

    async updatePhase1Question() {
        throw new BadRequestException('Mise a jour de questions desactivee');
    }

    async createPhase2Question() {
        throw new BadRequestException('Creation de questions desactivee');
    }

    async updatePhase2Question() {
        throw new BadRequestException('Mise a jour de questions desactivee');
    }

    /**
     * Nouvelle méthode adaptative : récupère le lot suivant de questions
     * basé sur le profil intermédiaire de l'utilisateur
     */
    async getNextBatchQuestions(dto: GetNextBatchDto) {
        const { assessment } = await resolveSessionAndAssessment(this.prisma, dto.sessionToken, {
            assessmentId: dto.assessmentId,
            requireInProgress: true,
        });

        const batchSize = dto.batchSize ?? assessment.batch_size ?? 5;

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
        await this.batch.startNewBatch(
            assessment.id,
            selectedQuestionIds,
            assessment.current_phase,
        );

        // Récupérer les détails des questions sélectionnées
        const languageId = await this.resolveLanguageId(dto.lang);

        if (assessment.current_phase === PhaseType.PHASE1) {
            const questions = await this.prisma.phase1Question.findMany({
                where: {
                    id: { in: selectedQuestionIds },
                    is_active: true,
                },
                include: {
                    translations: languageId
                        ? {
                              where: { language_id: languageId },
                              take: 1,
                          }
                        : false,
                    profiles: {
                        where: { phase: PhaseType.PHASE1 },
                        select: {
                            riasec_type: true,
                            weight: true,
                        },
                    },
                },
                orderBy: { display_order: 'asc' },
            });

            return questions.map((q) => {
                const t = q.translations?.[0];
                return {
                    id: q.id,
                    riasecType: q.riasec_type_id,
                    text: t?.question_text ?? q.question_text,
                    short: t?.question_short ?? q.question_short,
                    illustrationUrl: q.illustration_url,
                    pointsValue: q.pointsValue,
                    displayOrder: q.display_order,
                    profiles: q.profiles.map((p) => ({
                        riasecType: p.riasec_type,
                        weight: p.weight,
                    })),
                };
            });
        } else {
            const currentSection = assessment.current_section ?? Phase2Type.OCCUPATIONS;
            const questions = await this.prisma.phase2Question.findMany({
                where: {
                    id: { in: selectedQuestionIds },
                    is_active: true,
                    phase2_type: currentSection,
                },
                include: {
                    translations: languageId
                        ? {
                              where: { language_id: languageId },
                              take: 1,
                          }
                        : false,
                    profiles: {
                        where: { phase: PhaseType.PHASE2 },
                        select: {
                            riasec_type: true,
                            weight: true,
                        },
                    },
                },
                orderBy: { display_order: 'asc' },
            });

            return questions.map((q) => {
                const t = q.translations?.[0];
                return {
                    id: q.id,
                    riasecType: q.riasec_type_id,
                    sectionType: q.phase2_type,
                    text: t?.question_text ?? q.question_text,
                    subtext: t?.question_subtext ?? q.question_subtext,
                    mediaUrl: q.media_url,
                    minValue: q.min_value,
                    maxValue: q.max_value,
                    valueLabels: q.value_labels,
                    pointsValue: q.points_value,
                    displayOrder: q.display_order,
                    profiles: q.profiles.map((p) => ({
                        riasecType: p.riasec_type,
                        weight: p.weight,
                    })),
                };
            });
        }
    }
}
