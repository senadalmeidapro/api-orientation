import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TestType, RiasecType, Question } from '@prisma/client';
import { resolveSessionAndAssessment } from '@common/utils/assessment.util';
import { CacheService } from '@common/cache/cache.service';
import { AdaptiveSelectionService } from './services/adaptive-selection.service';
import { BatchManagementService } from '../sessions/services/batch-management.service';
import { MultiProfileUtil } from '@common/utils/multi-profile.util';
import { GetQuestionsDto, GetNextBatchDto } from './dto';

const defaultDepth = 5;

@Injectable()
export class QuestionsService {
  private readonly logger = new Logger(QuestionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly adaptive: AdaptiveSelectionService,
    private readonly batch: BatchManagementService,
  ) {}

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

  async getQuestions(dto: GetQuestionsDto) {
    const { assessment } = await resolveSessionAndAssessment(this.prisma, dto.sessionToken, {
      ...(dto.assessmentId !== undefined ? { assessmentId: dto.assessmentId } : {}),
      ...(dto.currentCategory !== undefined ? { currentCategory: dto.currentCategory } : {}),
      requireInProgress: true,
    });

    const targetSection = dto.currentCategory ?? assessment.currentCategory ?? TestType.OCCUPATIONS;
    if (assessment.currentCategory && assessment.currentCategory !== targetSection) {
      throw new BadRequestException('Section courante invalide pour cette requete');
    }

    const responses = await this.prisma.response.findMany({
      where: { assessmentId: assessment.id },
      select: { questionId: true, question: { select: { riasecTypeId: true } } },
    });
    const answeredIds = new Set(responses.map((r) => r.questionId));
    const answeredCounts = this.emptyScores();
    for (const response of responses) {
      answeredCounts[response.question.riasecTypeId] += 1;
    }

    const cacheKey = `questions:${assessment.testVersionId}:${targetSection}`;
    let questions = await this.cache.get<Question[]>(cacheKey);
    if (!questions) {
      questions = await this.prisma.question.findMany({
        where: {
          isActive: true,
          testVersionId: assessment.testVersionId,
          category: targetSection,
        },
        orderBy: { displayOrder: 'asc' },
      });
      await this.cache.set(cacheKey, questions, 300);
    }

    const depth = assessment.depth ?? defaultDepth;
    const filtered = this.applyDepthFilter(questions, answeredIds, answeredCounts, depth);
    const limited = dto.take ? filtered.slice(0, dto.take) : filtered;

    return limited.map((q) => {
      return {
        id: q.id,
        riasecType: q.riasecTypeId,
        category: q.category,
        text: q.questionText,
        mediaUrl: q.mediaUrl,
        minValue: q.minValue,
        maxValue: q.maxValue,
        valueLabels: q.valueLabels,
        pointsValue: q.pointsValue,
        displayOrder: q.displayOrder,
      };
    });
  }

  createGeneralQuestion() {
    throw new BadRequestException('Creation de questions desactivee');
  }

  updateGeneralQuestion() {
    throw new BadRequestException('Mise a jour de questions desactivee');
  }

  createSpecificQuestion() {
    throw new BadRequestException('Creation de questions desactivee');
  }

  updateSpecificQuestion() {
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
    await this.batch.startNewBatch(assessment.id, selectedQuestionIds);

    // Récupérer les détails des questions sélectionnées

    const currentCategory = assessment.currentCategory ?? TestType.OCCUPATIONS;
    const questions = await this.prisma.question.findMany({
      where: {
        id: { in: selectedQuestionIds },
        isActive: true,
        category: currentCategory,
      },
      include: {
        profiles: {
          where: { category: currentCategory },
          select: {
            riasecType: true,
            weight: true,
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return questions.map((q) => {
      return {
        id: q.id,
        riasecType: q.riasecTypeId,
        category: q.category,
        text: q.questionText,
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
