import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AssessmentStatus, Phase2Type, PhaseType, RiasecType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RecommendationsService } from '../recommendations/recommendations.service';
import { ResultsService } from '../results/results.service';
import { AiClient, JsonSchemaFormat } from './ai.client';
import { AiChatDto, AiCoachDto, AiSummaryDto } from './dto';
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
    private readonly logger = new Logger(AiService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly resultsService: ResultsService,
        private readonly recommendationsService: RecommendationsService,
        private readonly ai: AiClient,
    ) {}

    async summary(dto: AiSummaryDto) {
        const session = await this.prisma.session.findUnique({
            where: { session_token: dto.sessionToken },
            include: { user: true },
        });
        if (!session) throw new NotFoundException('Session introuvable');

        const assessment = dto.assessmentId
            ? await this.prisma.assessment.findFirst({
                  where: { id: dto.assessmentId, session_id: session.id },
              })
            : await this.prisma.assessment.findFirst({
                  where: { session_id: session.id, status: AssessmentStatus.COMPLETED },
                  orderBy: { completed_at: 'desc' },
              });
        if (!assessment) throw new NotFoundException('Aucun test disponible pour cette session');

        let result = await this.prisma.assessmentResult.findUnique({
            where: { assessment_id: assessment.id },
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
        const behavior = await this.computeBehaviorMetrics(assessment.id, assessment.current_phase);
        const profile = this.mergeProfiles(null, session.user?.bio);

        const context = {
            session: {
                id: session.id,
                profile,
            },
            assessment: {
                id: assessment.id,
                type: assessment.type,
                currentPhase: assessment.current_phase,
                currentSection: assessment.current_section,
                completionPercentage: assessment.completion_percentage,
                startedAt: assessment.started_at,
            },
            result: {
                phase1Code: result.phase1_code,
                phase2Code: result.phase2_code,
                strengths: result.strengths,
                consistencyLevel: result.consistency_level,
                profileStrength: result.profile_strength,
                differentiationScore: result.differentiation_score,
                phase1Scores: result.phase1_scores,
                phase2Scores: result.phase2_scores,
                sectionScores: result.section_scores,
            },
            recommendations: recommendations.map((rec) => ({
                id: rec.career.id,
                name: rec.career.name,
                category: rec.career.category,
                summary: rec.career.summary,
                riasecCodes: rec.career.riasecCodes,
                matchScore: rec.match_score,
                rankPosition: rec.rank_position,
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

        if (
            dto.section &&
            assessment.current_section &&
            dto.section !== assessment.current_section
        ) {
            throw new BadRequestException('Section courante invalide pour cette requete');
        }

        const partialScores = await this.computePartialScores(
            assessment.id,
            assessment.current_phase,
            dto.section,
        );
        const behavior = await this.computeBehaviorMetrics(assessment.id, assessment.current_phase);
        const candidates = await this.getCandidateQuestions(
            assessment,
            dto.section,
            dto.maxQuestions,
        );
        if (!candidates.length) {
            throw new BadRequestException('Aucune question disponible');
        }
        const profile = this.mergeProfiles(null, session.user?.bio);
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
                currentPhase: assessment.current_phase,
                currentSection: assessment.current_section,
                completionPercentage: assessment.completion_percentage,
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

    async chat(dto: AiChatDto) {
        const session = await this.prisma.session.findUnique({
            where: { session_token: dto.sessionToken },
            include: { user: true },
        });
        if (!session) throw new NotFoundException('Session introuvable');

        const assessment = dto.assessmentId
            ? await this.prisma.assessment.findFirst({
                  where: { id: dto.assessmentId, session_id: session.id },
              })
            : await this.prisma.assessment.findFirst({
                  where: { session_id: session.id },
                  orderBy: { started_at: 'desc' },
              });
        if (!assessment) throw new NotFoundException('Aucun test disponible pour cette session');

        let result = await this.prisma.assessmentResult.findUnique({
            where: { assessment_id: assessment.id },
        });
        if (!result && assessment.status === AssessmentStatus.COMPLETED) {
            result = await this.resultsService.compute({
                sessionToken: dto.sessionToken,
                assessmentId: assessment.id,
            });
        }

        const recommendations =
            result && assessment.status === AssessmentStatus.COMPLETED
                ? await this.ensureRecommendations(dto.sessionToken, assessment.id, 6)
                : [];
        const behavior = await this.computeBehaviorMetrics(assessment.id, assessment.current_phase);
        const profile = this.mergeProfiles(null, session.user?.bio);

        const context = {
            session: {
                id: session.id,
                profile,
            },
            assessment: {
                id: assessment.id,
                type: assessment.type,
                status: assessment.status,
                currentPhase: assessment.current_phase,
                currentSection: assessment.current_section,
                completionPercentage: assessment.completion_percentage,
            },
            result: result
                ? {
                      phase1Code: result.phase1_code,
                      phase2Code: result.phase2_code,
                      strengths: result.strengths,
                      consistencyLevel: result.consistency_level,
                      profileStrength: result.profile_strength,
                      differentiationScore: result.differentiation_score,
                  }
                : null,
            recommendations: recommendations.map((rec) => ({
                id: rec.career.id,
                name: rec.career.name,
                category: rec.career.category,
                summary: rec.career.summary,
                riasecCodes: rec.career.riasecCodes,
                matchScore: rec.match_score,
                rankPosition: rec.rank_position,
            })),
            behavior,
        };

        const instructions = [
            "Tu es un conseiller d'orientation.",
            'Reponds en francais, clair, concis et actionnable.',
            'Ne demande pas de donnees personnelles.',
            "Si le test est incomplet, guide l'utilisateur.",
        ].join(' ');
        const input = JSON.stringify({
            task: 'Conversation de conseil en orientation.',
            message: dto.message,
            context,
        });

        const response = await this.ai.respondText({
            instructions,
            input,
        });

        return { reply: response.text };
    }

    private emptyScores(): RiasecScores {
        return { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    }

    private buildCountsFromResponses(
        responses: Array<{ question: { riasec_type_id: RiasecType } }>,
    ): Record<RiasecType, number> {
        const counts = this.emptyScores();
        for (const response of responses) {
            counts[response.question.riasec_type_id] += 1;
        }
        return counts;
    }

    private applyDepthFilter<
        T extends { id: number; riasec_type_id: RiasecType; display_order: number },
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
            const count = remaining[question.riasec_type_id] ?? 0;
            if (count <= 0) continue;
            selected.push(question);
            remaining[question.riasec_type_id] = count - 1;
        }
        return selected.sort((a, b) => a.display_order - b.display_order);
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

        if (phase === PhaseType.PHASE1) {
            const responses = await this.prisma.phase1Response.findMany({
                where: { assessment_id: assessmentId },
                select: { response_value: true, question: { select: { riasec_type_id: true } } },
            });
            for (const response of responses) {
                this.addScore(
                    phase1Scores,
                    response.question.riasec_type_id,
                    response.response_value,
                );
            }
        } else if (phase === PhaseType.PHASE2) {
            const responses = await this.prisma.phase2Response.findMany({
                where: {
                    assessment_id: assessmentId,
                    ...(section ? { phase2_type: section } : {}),
                },
                select: { response_value: true, question: { select: { riasec_type_id: true } } },
            });
            for (const response of responses) {
                this.addScore(
                    phase2Scores,
                    response.question.riasec_type_id,
                    response.response_value,
                );
            }
        }

        return {
            phase1Scores,
            phase2Scores,
        };
    }

    private async computeBehaviorMetrics(assessmentId: string, phase: PhaseType) {
        let responses: Array<{ response_time_ms: number | null }> = [];
        if (phase === PhaseType.PHASE1) {
            responses = await this.prisma.phase1Response.findMany({
                where: { assessment_id: assessmentId, response_time_ms: { not: null } },
                select: { response_time_ms: true },
            });
        } else if (phase === PhaseType.PHASE2) {
            responses = await this.prisma.phase2Response.findMany({
                where: { assessment_id: assessmentId, response_time_ms: { not: null } },
                select: { response_time_ms: true },
            });
        }

        const times = responses
            .map((r) => r.response_time_ms ?? 0)
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
            test_version_id: number;
            current_phase: PhaseType;
            current_section: Phase2Type | null;
            depth: number;
        },
        section?: Phase2Type,
        maxQuestions = 5,
    ): Promise<CandidateQuestion[]> {
        const poolSize = Math.max(10, maxQuestions * 2);
        const depth = assessment.depth ?? DEFAULT_DEPTH;
        if (assessment.current_phase === PhaseType.PHASE1) {
            const answered = await this.prisma.phase1Response.findMany({
                where: { assessment_id: assessment.id },
                select: { question_id: true, question: { select: { riasec_type_id: true } } },
            });
            const answeredSet = new Set(answered.map((r) => r.question_id));
            const answeredCounts = this.buildCountsFromResponses(answered);
            const questions = await this.prisma.phase1Question.findMany({
                where: { is_active: true, test_version_id: assessment.test_version_id },
                orderBy: { display_order: 'asc' },
                select: {
                    id: true,
                    riasec_type_id: true,
                    question_text: true,
                    display_order: true,
                },
            });
            return this.applyDepthFilter(questions, answeredSet, answeredCounts, depth)
                .slice(0, poolSize)
                .map((q) => ({ id: q.id, text: q.question_text, riasecType: q.riasec_type_id }));
        }

        const targetSection = section ?? assessment.current_section ?? Phase2Type.OCCUPATIONS;
        const answered = await this.prisma.phase2Response.findMany({
            where: { assessment_id: assessment.id, phase2_type: targetSection },
            select: { question_id: true, question: { select: { riasec_type_id: true } } },
        });
        const answeredSet = new Set(answered.map((r) => r.question_id));
        const answeredCounts = this.buildCountsFromResponses(answered);
        const questions = await this.prisma.phase2Question.findMany({
            where: {
                is_active: true,
                test_version_id: assessment.test_version_id,
                phase2_type: targetSection,
            },
            orderBy: { display_order: 'asc' },
            select: {
                id: true,
                riasec_type_id: true,
                question_text: true,
                phase2_type: true,
                display_order: true,
            },
        });
        return this.applyDepthFilter(questions, answeredSet, answeredCounts, depth)
            .slice(0, poolSize)
            .map((q) => ({
                id: q.id,
                text: q.question_text,
                riasecType: q.riasec_type_id,
                sectionType: q.phase2_type,
            }));
    }

    private async ensureRecommendations(sessionToken: string, assessmentId: string, limit: number) {
        const existing = await this.prisma.assessmentCareerRecommendation.findMany({
            where: { result: { assessment_id: assessmentId } },
            include: { career: true },
            orderBy: { rank_position: 'asc' },
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
            where: { result: { assessment_id: assessmentId } },
            include: { career: true },
            orderBy: { rank_position: 'asc' },
            take: 6,
        });
        return recs.map((rec) => ({
            name: rec.career.name,
            category: rec.career.category,
            matchScore: rec.match_score,
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
