import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PhaseType, SectionType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RecommendationsService } from '../recommendations/recommendations.service';
import { ResultsService } from '../results/results.service';
import { AiClient, JsonSchemaFormat } from './ai.client';
import { AiCoachDto, AiSummaryDto } from './dto';

const RIASEC_CODES = ['R', 'I', 'A', 'S', 'E', 'C'] as const;

type RiasecScores = Record<(typeof RIASEC_CODES)[number], number>;

type CandidateQuestion = {
    id: number;
    text: string;
    riasecType: string;
    sectionType?: SectionType;
};

@Injectable()
export class AiService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly resultsService: ResultsService,
        private readonly recommendationsService: RecommendationsService,
        private readonly ai: AiClient,
    ) {}

    async summary(dto: AiSummaryDto) {
        const session = await this.prisma.testSession.findUnique({
            where: { sessionToken: dto.sessionToken },
        });
        if (!session) throw new NotFoundException('Session introuvable');

        let result = await this.prisma.sessionResult.findUnique({
            where: { sessionId: session.id },
        });
        if (!result) {
            if (!session.phase1CompletedAt || !session.phase2CompletedAt) {
                throw new BadRequestException('Resultat indisponible, test non termine');
            }
            result = await this.resultsService.compute({ sessionToken: dto.sessionToken });
        }

        const recommendations = await this.ensureRecommendations(dto.sessionToken, dto.limit ?? 6);
        const behavior = await this.computeBehaviorMetrics(session.id, session.currentPhase);

        const context = {
            session: {
                currentPhase: session.currentPhase,
                completionPercentage: session.completionPercentage,
                startedAt: session.startedAt,
            },
            result: {
                phase1Code: result.phase1Code,
                phase2Code: result.phase2Code,
                strengths: result.strengths,
                consistencyLevel: result.consistencyLevel,
                profileStrength: result.profileStrength,
                differentiationScore: result.differentiationScore,
                phase1Scores: result.phase1Scores,
                phase2Scores: result.phase2Scores,
                sectionScores: result.sectionScores,
            },
            recommendations: recommendations.map((rec) => ({
                id: rec.career.id,
                name: rec.career.name,
                category: rec.career.category,
                summary: rec.career.summary,
                riasecCodes: rec.career.riasecCodes,
                matchScore: rec.matchScore,
                rankPosition: rec.rankPosition,
            })),
            behavior,
        };

        const schema: JsonSchemaFormat = {
            name: 'riasec_summary',
            strict: true,
            schema: {
                type: 'object',
                properties: {
                    summary: { type: 'string' },
                    profile: {
                        type: 'object',
                        properties: {
                            phase1Code: { type: 'string' },
                            phase2Code: { type: 'string' },
                            strengths: { type: 'array', items: { type: 'string' } },
                            consistencyLevel: { type: 'string' },
                            profileStrength: { type: 'string' },
                        },
                        required: ['phase1Code', 'phase2Code'],
                    },
                    recommendations: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                rationale: { type: 'string' },
                            },
                            required: ['name', 'rationale'],
                        },
                    },
                    nextSteps: { type: 'array', items: { type: 'string' } },
                },
                required: ['summary', 'recommendations', 'nextSteps'],
            },
        };

        const instructions =
            "Tu es un conseiller d'orientation RIASEC. Reponds en francais, clair, concret, et personnalise.";
        const input = JSON.stringify({
            task: 'Resume le profil et propose des recommandations et prochaines actions.',
            context,
        });

        const response = await this.ai.respondJson({
            instructions,
            input,
            schema,
        });

        return response.json;
    }

    async coach(dto: AiCoachDto) {
        const session = await this.prisma.testSession.findUnique({
            where: { sessionToken: dto.sessionToken },
        });
        if (!session) throw new NotFoundException('Session introuvable');

        const partialScores = await this.computePartialScores(session.id, session.currentPhase);
        const behavior = await this.computeBehaviorMetrics(session.id, session.currentPhase);
        const candidates = await this.getCandidateQuestions(session, dto.section, dto.maxQuestions);
        if (!candidates.length) {
            throw new BadRequestException('Aucune question disponible');
        }
        const recommendations: Array<{
            name: string;
            category: string | null;
            matchScore: number;
        }> = [];

        const schema: JsonSchemaFormat = {
            name: 'riasec_coach',
            strict: true,
            schema: {
                type: 'object',
                properties: {
                    profileGuess: {
                        type: 'object',
                        properties: {
                            topCodes: { type: 'array', items: { type: 'string' } },
                            confidence: { type: 'number' },
                        },
                        required: ['topCodes', 'confidence'],
                    },
                    nextQuestionIds: { type: 'array', items: { type: 'number' } },
                    message: { type: 'string' },
                    rationale: { type: 'string' },
                    recommendations: { type: 'array', items: { type: 'string' } },
                },
                required: ['nextQuestionIds', 'message'],
            },
        };

        const instructions =
            "Tu es un coach d'orientation. Choisis les meilleures questions suivantes pour affiner le profil.";
        const input = JSON.stringify({
            task: 'Selectionner les prochaines questions et donner un message clair.',
            session: {
                currentPhase: session.currentPhase,
                currentSection: session.currentSection,
                completionPercentage: session.completionPercentage,
            },
            partialScores,
            behavior,
            recommendations,
            candidates,
            userMessage: dto.message ?? null,
            rules: {
                chooseFromCandidatesOnly: true,
                maxQuestions: dto.maxQuestions ?? 5,
            },
        });

        const response = await this.ai.respondJson({
            instructions,
            input,
            schema,
        });

        const allowed = new Set(candidates.map((q) => q.id));
        const requested = Array.isArray(response.json?.nextQuestionIds)
            ? response.json.nextQuestionIds
            : [];
        const filtered = requested.filter((id) => typeof id === 'number' && allowed.has(id));
        const limit = dto.maxQuestions ?? 5;
        const finalIds = filtered.length
            ? filtered.slice(0, limit)
            : candidates.slice(0, limit).map((q) => q.id);
        const finalQuestions = candidates.filter((q) => finalIds.includes(q.id));

        return {
            ...response.json,
            nextQuestionIds: finalIds,
            nextQuestions: finalQuestions,
        };
    }

    private emptyScores(): RiasecScores {
        return { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    }

    private addScore(scores: RiasecScores, code: string | null, value: number) {
        if (!code) return;
        if ((RIASEC_CODES as readonly string[]).includes(code)) {
            scores[code as keyof RiasecScores] += value;
        }
    }

    private async computePartialScores(sessionId: string, phase: PhaseType) {
        const phase1Scores = this.emptyScores();
        const phase2Scores = this.emptyScores();

        if (phase === PhaseType.PHASE_1) {
            const responses = await this.prisma.phase1Response.findMany({
                where: { sessionId },
                select: { responseValue: true, question: { select: { riasecTypeId: true } } },
            });
            for (const response of responses) {
                this.addScore(phase1Scores, response.question.riasecTypeId, response.responseValue);
            }
        } else if (phase === PhaseType.PHASE_2) {
            const responses = await this.prisma.phase2Response.findMany({
                where: { sessionId },
                select: { responseValue: true, question: { select: { riasecTypeId: true } } },
            });
            for (const response of responses) {
                this.addScore(phase2Scores, response.question.riasecTypeId, response.responseValue);
            }
        }

        return {
            phase1Scores,
            phase2Scores,
        };
    }

    private async computeBehaviorMetrics(sessionId: string, phase: PhaseType) {
        let responses: Array<{ responseTimeMs: number | null }> = [];
        if (phase === PhaseType.PHASE_1) {
            responses = await this.prisma.phase1Response.findMany({
                where: { sessionId, responseTimeMs: { not: null } },
                select: { responseTimeMs: true },
            });
        } else if (phase === PhaseType.PHASE_2) {
            responses = await this.prisma.phase2Response.findMany({
                where: { sessionId, responseTimeMs: { not: null } },
                select: { responseTimeMs: true },
            });
        }

        const times = responses
            .map((r) => r.responseTimeMs ?? 0)
            .filter((v) => Number.isFinite(v) && v > 0);

        if (!times.length) {
            return { responseCount: 0, avgResponseTimeMs: null, responseVarianceMs: null };
        }

        const avg = times.reduce((sum, v) => sum + v, 0) / times.length;
        const variance = times.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / times.length;

        return {
            responseCount: times.length,
            avgResponseTimeMs: Math.round(avg),
            responseVarianceMs: Math.round(variance),
        };
    }

    private async getCandidateQuestions(
        session: {
            id: string;
            testVersionId: number;
            currentPhase: PhaseType;
            currentSection: SectionType | null;
        },
        section?: SectionType,
        maxQuestions = 5,
    ): Promise<CandidateQuestion[]> {
        const poolSize = Math.max(10, maxQuestions * 2);
        if (session.currentPhase === PhaseType.PHASE_1) {
            const answered = await this.prisma.phase1Response.findMany({
                where: { sessionId: session.id },
                select: { questionId: true },
            });
            const answeredSet = new Set(answered.map((r) => r.questionId));
            const questions = await this.prisma.phase1Question.findMany({
                where: { isActive: true, testVersionId: session.testVersionId },
                orderBy: { displayOrder: 'asc' },
                select: { id: true, riasecTypeId: true, questionText: true },
            });
            return questions
                .filter((q) => !answeredSet.has(q.id))
                .slice(0, poolSize)
                .map((q) => ({ id: q.id, text: q.questionText, riasecType: q.riasecTypeId }));
        }

        const targetSection = section ?? session.currentSection ?? SectionType.OCCUPATIONS;
        const answered = await this.prisma.phase2Response.findMany({
            where: { sessionId: session.id },
            select: { questionId: true },
        });
        const answeredSet = new Set(answered.map((r) => r.questionId));
        const questions = await this.prisma.phase2Question.findMany({
            where: {
                isActive: true,
                testVersionId: session.testVersionId,
                sectionType: targetSection,
            },
            orderBy: { displayOrder: 'asc' },
            select: { id: true, riasecTypeId: true, questionText: true, sectionType: true },
        });
        return questions
            .filter((q) => !answeredSet.has(q.id))
            .slice(0, poolSize)
            .map((q) => ({
                id: q.id,
                text: q.questionText,
                riasecType: q.riasecTypeId,
                sectionType: q.sectionType,
            }));
    }

    private async ensureRecommendations(sessionToken: string, limit: number) {
        const existing = await this.prisma.sessionCareerRecommendation.findMany({
            where: { result: { session: { sessionToken } } },
            include: { career: true },
            orderBy: { rankPosition: 'asc' },
            take: limit,
        });
        if (existing.length) return existing;
        return this.recommendationsService.getRecommendations({ sessionToken, limit });
    }

    private async getExistingRecommendations(sessionId: string) {
        const recs = await this.prisma.sessionCareerRecommendation.findMany({
            where: { result: { sessionId } },
            include: { career: true },
            orderBy: { rankPosition: 'asc' },
            take: 6,
        });
        return recs.map((rec) => ({
            name: rec.career.name,
            category: rec.career.category,
            matchScore: rec.matchScore,
        }));
    }
}
