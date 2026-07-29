import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { TestStatus, TestType, RiasecType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RecommendationsService } from '../recommendations/recommendations.service';
import { ResultsService } from '../results/results.service';
import { JsonSchemaFormat } from './ai.client';
import { AiProviderFactory } from './ai-provider.factory';
import { AiChatDto, AiCoachDto, AiSummaryDto } from './dto';
import { resolveSessionAndAssessment } from '@common/utils/assessment.util';

const riasecCodes = ['R', 'I', 'A', 'S', 'E', 'C'] as const;

type RiasecScores = Record<(typeof riasecCodes)[number], number>;

type CandidateQuestion = {
  id: number;
  text: string;
  riasecType: string;
  sectionType?: TestType;
};

type RecommendationContextItem = {
  career: {
    id: number;
    name: string;
    category: string | null;
    summary: string | null;
    riasecCodes: string[] | null;
  };
  matchScore: number;
  rankPosition: number;
};

const defaultDepth = 5;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly resultsService: ResultsService,
    private readonly recommendationsService: RecommendationsService,
    private readonly aiProvider: AiProviderFactory,
  ) {}

  async summary(dto: AiSummaryDto): Promise<Record<string, unknown>> {
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
          where: { sessionId: session.id, status: TestStatus.COMPLETED },
          orderBy: { completedAt: 'desc' },
        });
    if (!assessment) throw new NotFoundException('Aucun test disponible pour cette session');

    let result = await this.prisma.assessmentResult.findUnique({
      where: { assessmentId: assessment.id },
    });
    if (!result) {
      if (assessment.status !== TestStatus.COMPLETED) {
        throw new BadRequestException('Résultat indisponible, test non termine');
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
    const resultView = this.toResultView(result);
    const behavior = await this.computeBehaviorMetrics(assessment.id, assessment.currentCategory);
    const profile = this.mergeProfiles(null, this.parseProfile(session.user?.bio));

    const context = {
      session: {
        id: session.id,
        profile,
      },
      assessment: {
        id: assessment.id,
        type: assessment.type,
        currentCategory: assessment.currentCategory,
        completionPercentage: assessment.completionPercentage,
        startedAt: assessment.startedAt,
      },
      result: {
        generalCode: resultView.generalCode,
        specificCode: resultView.specificCode,
        strengths: result.strengths,
        consistencyLevel: result.consistencyLevel,
        profileStrength: result.profileStrength,
        differentiationScore: result.differentiationScore,
        generalScores: resultView.generalScores,
        specificScores: resultView.specificScores,
        sectionScores: resultView.sectionScores,
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
              generalCode: { type: 'string' },
              specificCode: { type: 'string' },
              strengths: { type: 'array', items: { type: 'string' } },
              consistencyLevel: { type: 'string' },
              profileStrength: { type: 'string' },
            },
            required: ['generalCode', 'specificCode'],
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
      "Tu es un conseiller d'orientation RIASEC. Réponds en français, clair, concret, et personnalise.";
    const input = JSON.stringify({
      task: 'Resume le profil et propose des recommandations et prochaines actions.',
      context,
    });

    const response = await this.aiProvider.getProvider().respondJson({
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

    if (dto.section && assessment.currentCategory && dto.section !== assessment.currentCategory) {
      throw new BadRequestException('Section courante invalide pour cette requête');
    }

    const partialScores = await this.computePartialScores(
      assessment.id,
      assessment.currentCategory,
      dto.section,
    );
    const behavior = await this.computeBehaviorMetrics(assessment.id, assessment.currentCategory);
    const candidates = await this.getCandidateQuestions(assessment, dto.section, dto.maxQuestions);
    if (!candidates.length) {
      throw new BadRequestException('Aucune question disponible');
    }
    const profile = this.mergeProfiles(null, this.parseProfile(session.user?.bio));
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
      task: 'Selection les prochaines questions et donner un message clair.',
      assessment: {
        currentCategory: assessment.currentCategory,
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

    const response = await this.aiProvider.getProvider().respondJson({
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
      where: { sessionToken: dto.sessionToken },
      include: { user: true },
    });
    if (!session) throw new NotFoundException('Session introuvable');

    const assessment = dto.assessmentId
      ? await this.prisma.assessment.findFirst({
          where: { id: dto.assessmentId, sessionId: session.id },
        })
      : await this.prisma.assessment.findFirst({
          where: { sessionId: session.id },
          orderBy: { startedAt: 'desc' },
        });
    if (!assessment) throw new NotFoundException('Aucun test disponible pour cette session');

    let result = await this.prisma.assessmentResult.findUnique({
      where: { assessmentId: assessment.id },
    });
    if (!result && assessment.status === TestStatus.COMPLETED) {
      result = await this.resultsService.compute({
        sessionToken: dto.sessionToken,
        assessmentId: assessment.id,
      });
    }

    const recommendations =
      result && assessment.status === TestStatus.COMPLETED
        ? await this.ensureRecommendations(dto.sessionToken, assessment.id, 6)
        : [];
    const behavior = await this.computeBehaviorMetrics(assessment.id, assessment.currentCategory);
    const profile = this.mergeProfiles(null, this.parseProfile(session.user?.bio));

    const context = {
      session: {
        id: session.id,
        profile,
      },
      assessment: {
        id: assessment.id,
        type: assessment.type,
        status: assessment.status,
        currentCategory: assessment.currentCategory,
        completionPercentage: assessment.completionPercentage,
      },
      result: result
        ? {
            generalCode: this.toResultView(result).generalCode,
            specificCode: this.toResultView(result).specificCode,
            strengths: result.strengths,
            consistencyLevel: result.consistencyLevel,
            profileStrength: result.profileStrength,
            differentiationScore: result.differentiationScore,
          }
        : null,
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

    const instructions = [
      "Tu es un conseiller d'orientation.",
      'Réponds en français, clair, concis et actionnable.',
      'Ne demande pas de donnees personnelles.',
      "Si le test est incomplet, guide l'utilisateur.",
    ].join(' ');
    const input = JSON.stringify({
      task: 'Conversation de conseil en orientation.',
      message: dto.message,
      context,
    });

    const response = await this.aiProvider.getProvider().respondText({
      instructions,
      input,
    });

    return { reply: response.text };
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
    if ((riasecCodes as readonly string[]).includes(code)) {
      scores[code as keyof RiasecScores] += value;
    }
  }

  private async computePartialScores(
    assessmentId: string,
    currentCategory: TestType | null,
    section?: TestType,
  ) {
    const generalScores = this.emptyScores();
    const specificScores = this.emptyScores();
    const targetCategory = section ?? currentCategory;

    const responses = await this.prisma.response.findMany({
      where: {
        assessmentId,
        ...(targetCategory ? { question: { category: targetCategory } } : {}),
      },
      select: {
        responseValue: true,
        question: { select: { riasecTypeId: true, category: true } },
      },
    });
    for (const response of responses) {
      const target =
        response.question.category === TestType.GENERALE ? generalScores : specificScores;
      this.addScore(target, response.question.riasecTypeId, response.responseValue);
    }

    return {
      generalScores,
      specificScores,
    };
  }

  private async computeBehaviorMetrics(assessmentId: string, category: TestType | null) {
    const responses = await this.prisma.response.findMany({
      where: {
        assessmentId,
        responseTimeMs: { not: null },
        ...(category ? { question: { category } } : {}),
      },
      select: { responseTimeMs: true },
    });

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
      currentCategory: TestType | null;
      depth: number;
    },
    section?: TestType,
    maxQuestions = 5,
  ): Promise<CandidateQuestion[]> {
    const poolSize = Math.max(10, maxQuestions * 2);
    const depth = assessment.depth ?? defaultDepth;
    const targetSection = section ?? assessment.currentCategory ?? TestType.OCCUPATIONS;
    const answered = await this.prisma.response.findMany({
      where: { assessmentId: assessment.id, question: { category: targetSection } },
      select: { questionId: true, question: { select: { riasecTypeId: true } } },
    });
    const answeredSet = new Set(answered.map((r) => r.questionId));
    const answeredCounts = this.buildCountsFromResponses(answered);
    const questions = await this.prisma.question.findMany({
      where: {
        isActive: true,
        testVersionId: assessment.testVersionId,
        category: targetSection,
      },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        riasecTypeId: true,
        questionText: true,
        category: true,
        displayOrder: true,
      },
    });
    return this.applyDepthFilter(questions, answeredSet, answeredCounts, depth)
      .slice(0, poolSize)
      .map((q) => ({
        id: q.id,
        text: q.questionText,
        riasecType: q.riasecTypeId,
        sectionType: q.category,
      }));
  }

  private toResultView(result: { riasecCode: string | null; scoresByCategory: unknown }) {
    const scores = this.isRecord(result.scoresByCategory) ? result.scoresByCategory : {};
    const generale = this.isRecord(scores.GENERALE) ? scores.GENERALE : null;
    const totalRaw = this.isRecord(scores.totalRaw) ? scores.totalRaw : null;
    return {
      generalCode: result.riasecCode,
      specificCode: result.riasecCode,
      generalScores: generale,
      specificScores: totalRaw,
      sectionScores: scores,
    };
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private toRecommendationContextItem(rec: unknown): RecommendationContextItem {
    const typed = rec as {
      career?: {
        id: number;
        name: string;
        category: string | null;
        summary: string | null;
        riasecCodes?: string[] | null;
      };
      id?: number;
      name?: string;
      category?: string | null;
      summary?: string | null;
      riasecCodes?: string[] | null;
      matchScore?: number;
      rankPosition?: number;
      match_score?: number;
      rank_position?: number;
    };

    const careerSource = typed.career ?? typed;
    const matchScore = typed.matchScore ?? typed.match_score;
    const rankPosition = typed.rankPosition ?? typed.rank_position;

    if (
      typeof careerSource.id !== 'number' ||
      typeof careerSource.name !== 'string' ||
      typeof matchScore !== 'number' ||
      typeof rankPosition !== 'number'
    ) {
      throw new InternalServerErrorException('Malformed recommendation payload');
    }

    const career = {
      id: careerSource.id,
      name: careerSource.name,
      category: careerSource.category ?? null,
      summary: careerSource.summary ?? null,
      riasecCodes: careerSource.riasecCodes ?? null,
    };

    return {
      career,
      matchScore,
      rankPosition,
    };
  }

  private async ensureRecommendations(
    sessionToken: string,
    assessmentId: string,
    limit: number,
  ): Promise<RecommendationContextItem[]> {
    const existing = await this.prisma.assessmentCareerRecommendation.findMany({
      where: { result: { assessmentId: assessmentId } },
      include: { career: true },
      orderBy: { rankPosition: 'asc' },
      take: limit,
    });
    if (existing.length) {
      return existing.map((rec) => this.toRecommendationContextItem(rec));
    }

    const generated = await this.recommendationsService.getCareerRecommendations(
      {
        assessmentId,
        limit,
      },
      sessionToken,
    );
    return generated.map((rec) => this.toRecommendationContextItem(rec));
  }

  private async getExistingRecommendations(assessmentId: string) {
    const recs = await this.prisma.assessmentCareerRecommendation.findMany({
      where: { result: { assessmentId: assessmentId } },
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
    sessionProfile?: Record<string, unknown> | null,
    userProfile?: Record<string, unknown> | null,
  ): Record<string, unknown> | null {
    const sessionObj = sessionProfile ?? null;
    const userObj = userProfile ?? null;
    if (sessionObj && userObj) {
      return { ...userObj, ...sessionObj };
    }
    return sessionObj ?? userObj ?? null;
  }

  private parseProfile(
    profile: string | Record<string, unknown> | null | undefined,
  ): Record<string, unknown> | null {
    if (!profile) {
      return null;
    }

    if (typeof profile === 'string') {
      try {
        const parsed: unknown = JSON.parse(profile);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
          ? (parsed as Record<string, unknown>)
          : null;
      } catch {
        return null;
      }
    }

    return profile;
  }
}
