import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AssessmentStatus, Phase2Type, PhaseType, RiasecType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RecommendationsService } from '../recommendations/recommendations.service';
import { ResultsService } from '../results/results.service';
import { AiClient, JsonSchemaFormat } from './ai.client';
import { AiCoachDto, AiSummaryDto } from './dto';
import { resolveSessionAndAssessment } from '../../common/utils/assessment.util';

const RIASEC_CODES = ['R', 'I', 'A', 'S', 'E', 'C'] as const;

type RiasecScores = Record<(typeof RIASEC_CODES)[number], number>;

type CandidateQuestion = {
    id: number;
    text: string;
    riasecType: string;
    sectionType?: Phase2Type;
};

const DEFAULT_DEPTH = 5;

@Injectable()
export class AiService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly resultsService: ResultsService,
        private readonly recommendationsService: RecommendationsService,
        private readonly ai: AiClient,
    ) {}

    async summary(dto: AiSummaryDto) {
        const session = await this.prisma.session.findUnique({
            where: { sessionToken: dto.sessionToken },
            include: { user: true },
        });
        if (!session) throw new NotFoundException('Session introuvable');

        const assessment = dto.assessmentId
            ? await this.prisma.assessment.findFirst({
                  where: { id: dto.assessmentId, sessionId: session.id },
              })
            : await this.prisma.assessment.findFirst({
                  where: { sessionId: session.id, status: AssessmentStatus.COMPLETED },
                  orderBy: { completedAt: 'desc' },
              });
        if (!assessment) throw new NotFoundException('Aucun test disponible pour cette session');

        let result = await this.prisma.assessmentResult.findUnique({
            where: { assessmentId: assessment.id },
        });
        if (!result) {
            if (assessment.status !== AssessmentStatus.COMPLETED) {
                throw new BadRequestException('Resultat indisponible, test non termine');
            }
            result = await this.resultsService.compute({
                sessionToken: dto.sessionToken,
                assessmentId: assessment.id,
            });
        }

        const recommendations = await this.ensureRecommendations(
            dto.sessionToken,
            assessment.id,
            dto.limit ?? 6,
        );
        const behavior = await this.computeBehaviorMetrics(assessment.id, assessment.currentPhase);
        const profile = this.mergeProfiles(session.profile, session.user?.profile);

        const context = {
            session: {
                id: session.id,
                profile,
            },
            assessment: {
                id: assessment.id,
                type: assessment.type,
                currentPhase: assessment.currentPhase,
                currentSection: assessment.currentSection,
                completionPercentage: assessment.completionPercentage,
                startedAt: assessment.startedAt,
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
        const { session, assessment } = await resolveSessionAndAssessment(
            this.prisma,
            dto.sessionToken,
            {
                assessmentId: dto.assessmentId,
                requireInProgress: true,
            },
        );

        if (dto.section && assessment.currentSection && dto.section !== assessment.currentSection) {
            throw new BadRequestException('Section courante invalide pour cette requete');
        }

        const partialScores = await this.computePartialScores(
            assessment.id,
            assessment.currentPhase,
            dto.section,
        );
        const behavior = await this.computeBehaviorMetrics(assessment.id, assessment.currentPhase);
        const candidates = await this.getCandidateQuestions(
            assessment,
            dto.section,
            dto.maxQuestions,
        );
        if (!candidates.length) {
            throw new BadRequestException('Aucune question disponible');
        }
        const profile = this.mergeProfiles(session.profile, session.user?.profile);
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
            assessment: {
                currentPhase: assessment.currentPhase,
                currentSection: assessment.currentSection,
                completionPercentage: assessment.completionPercentage,
            },
            profile,
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

    private buildCountsFromResponses(
        responses: Array<{ question: { riasecTypeId: RiasecType } }>,
    ): Record<RiasecType, number> {
        const counts = this.emptyScores();
        for (const response of responses) {
            counts[response.question.riasecTypeId] += 1;
        }
        return counts;
    }

    private applyDepthFilter<
        T extends { id: number; riasecTypeId: RiasecType; displayOrder: number },
    >(
        questions: T[],
        answered: Set<number>,
        answeredCounts: Record<RiasecType, number>,
        depth: number,
    ) {
        const remaining = this.emptyScores();
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

    private addScore(scores: RiasecScores, code: string | null, value: number) {
        if (!code) return;
        if ((RIASEC_CODES as readonly string[]).includes(code)) {
            scores[code as keyof RiasecScores] += value;
        }
    }

    private async computePartialScores(
        assessmentId: string,
        phase: PhaseType,
        section?: Phase2Type,
    ) {
        const phase1Scores = this.emptyScores();
        const phase2Scores = this.emptyScores();

        if (phase === PhaseType.PHASE_1) {
            const responses = await this.prisma.phase1Response.findMany({
                where: { assessmentId },
                select: { responseValue: true, question: { select: { riasecTypeId: true } } },
            });
            for (const response of responses) {
                this.addScore(phase1Scores, response.question.riasecTypeId, response.responseValue);
            }
        } else if (phase === PhaseType.PHASE_2) {
            const responses = await this.prisma.phase2Response.findMany({
                where: {
                    assessmentId,
                    ...(section ? { phase2Type: section } : {}),
                },
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

    private async computeBehaviorMetrics(assessmentId: string, phase: PhaseType) {
        let responses: Array<{ responseTimeMs: number | null }> = [];
        if (phase === PhaseType.PHASE_1) {
            responses = await this.prisma.phase1Response.findMany({
                where: { assessmentId, responseTimeMs: { not: null } },
                select: { responseTimeMs: true },
            });
        } else if (phase === PhaseType.PHASE_2) {
            responses = await this.prisma.phase2Response.findMany({
                where: { assessmentId, responseTimeMs: { not: null } },
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
        assessment: {
            id: string;
            testVersionId: number;
            currentPhase: PhaseType;
            currentSection: Phase2Type | null;
            depth: number;
        },
        section?: Phase2Type,
        maxQuestions = 5,
    ): Promise<CandidateQuestion[]> {
        const poolSize = Math.max(10, maxQuestions * 2);
        const depth = assessment.depth ?? DEFAULT_DEPTH;
        if (assessment.currentPhase === PhaseType.PHASE_1) {
            const answered = await this.prisma.phase1Response.findMany({
                where: { assessmentId: assessment.id },
                select: { questionId: true, question: { select: { riasecTypeId: true } } },
            });
            const answeredSet = new Set(answered.map((r) => r.questionId));
            const answeredCounts = this.buildCountsFromResponses(answered);
            const questions = await this.prisma.phase1Question.findMany({
                where: { isActive: true, testVersionId: assessment.testVersionId },
                orderBy: { displayOrder: 'asc' },
                select: { id: true, riasecTypeId: true, questionText: true, displayOrder: true },
            });
            return this.applyDepthFilter(questions, answeredSet, answeredCounts, depth)
                .slice(0, poolSize)
                .map((q) => ({ id: q.id, text: q.questionText, riasecType: q.riasecTypeId }));
        }

        const targetSection = section ?? assessment.currentSection ?? Phase2Type.OCCUPATIONS;
        const answered = await this.prisma.phase2Response.findMany({
            where: { assessmentId: assessment.id, phase2Type: targetSection },
            select: { questionId: true, question: { select: { riasecTypeId: true } } },
        });
        const answeredSet = new Set(answered.map((r) => r.questionId));
        const answeredCounts = this.buildCountsFromResponses(answered);
        const questions = await this.prisma.phase2Question.findMany({
            where: {
                isActive: true,
                testVersionId: assessment.testVersionId,
                phase2Type: targetSection,
            },
            orderBy: { displayOrder: 'asc' },
            select: {
                id: true,
                riasecTypeId: true,
                questionText: true,
                phase2Type: true,
                displayOrder: true,
            },
        });
        return this.applyDepthFilter(questions, answeredSet, answeredCounts, depth)
            .slice(0, poolSize)
            .map((q) => ({
                id: q.id,
                text: q.questionText,
                riasecType: q.riasecTypeId,
                sectionType: q.phase2Type,
            }));
    }

    private async ensureRecommendations(sessionToken: string, assessmentId: string, limit: number) {
        const existing = await this.prisma.assessmentCareerRecommendation.findMany({
            where: { result: { assessmentId } },
            include: { career: true },
            orderBy: { rankPosition: 'asc' },
            take: limit,
        });
        if (existing.length) return existing;
        return this.recommendationsService.getRecommendations({
            sessionToken,
            assessmentId,
            limit,
        });
    }

    private async getExistingRecommendations(assessmentId: string) {
        const recs = await this.prisma.assessmentCareerRecommendation.findMany({
            where: { result: { assessmentId } },
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

    private mergeProfiles(
        sessionProfile?: unknown | null,
        userProfile?: unknown | null,
    ): Record<string, unknown> | null {
        const sessionObj =
            sessionProfile && typeof sessionProfile === 'object'
                ? (sessionProfile as Record<string, unknown>)
                : null;
        const userObj =
            userProfile && typeof userProfile === 'object'
                ? (userProfile as Record<string, unknown>)
                : null;
        if (sessionObj && userObj) {
            return { ...userObj, ...sessionObj };
        }
        return sessionObj ?? userObj ?? null;
    }
}
