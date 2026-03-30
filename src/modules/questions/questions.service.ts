import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetPhase1QuestionsDto } from './dto/get-phase1-questions.dto';
import { GetPhase2QuestionsDto } from './dto/get-phase2-questions.dto';
import { Phase2Type, PhaseType, RiasecType } from '@prisma/client';
import { resolveSessionAndAssessment } from '../../common/utils/assessment.util';

const DEFAULT_DEPTH = 5;

@Injectable()
export class QuestionsService {
    constructor(private readonly prisma: PrismaService) {}

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
            assessmentId: dto.assessmentId,
            phase: PhaseType.PHASE_1,
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

        const questions = await this.prisma.phase1Question.findMany({
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

        const depth = assessment.depth ?? DEFAULT_DEPTH;
        const filtered = this.applyDepthFilter(questions, answeredIds, answeredCounts, depth);

        return filtered.map((q) => {
            const t = q.translations?.[0];
            return {
                id: q.id,
                riasecType: q.riasecTypeId,
                text: t?.questionText ?? q.questionText,
                short: t?.questionShort ?? q.questionShort,
                illustrationUrl: q.illustrationUrl,
                pointsValue: q.pointsValue,
                displayOrder: q.displayOrder,
            };
        });
    }

    async getPhase2Questions(dto: GetPhase2QuestionsDto) {
        const { assessment } = await resolveSessionAndAssessment(this.prisma, dto.sessionToken, {
            assessmentId: dto.assessmentId,
            phase: PhaseType.PHASE_2,
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

        const questions = await this.prisma.phase2Question.findMany({
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

        const depth = assessment.depth ?? DEFAULT_DEPTH;
        const filtered = this.applyDepthFilter(questions, answeredIds, answeredCounts, depth);

        return filtered.map((q) => {
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

    // async createPhase1Question() {
    //     throw new BadRequestException('Creation de questions desactivee');
    // }

    // async updatePhase1Question() {
    //     throw new BadRequestException('Mise a jour de questions desactivee');
    // }

    // async createPhase2Question() {
    //     throw new BadRequestException('Creation de questions desactivee');
    // }

    // async updatePhase2Question() {
    //     throw new BadRequestException('Mise a jour de questions desactivee');
    // }
}
