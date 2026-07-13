import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateResponsesDto } from './dto/create-responses.dto';
import { SubmitBatchResponsesDto } from './dto/submit-batch-responses.dto';
import { TestStatus, TestType, RiasecType } from '@prisma/client';
import { BadgesService } from '../badges/badges.service';
import { resolveSessionAndAssessment } from '@common/utils/assessment.util';
import { BehavioralAnalysisService } from './services/behavioral-analysis.service';
import { BatchManagementService } from '../sessions/services/batch-management.service';
import { AdaptiveSelectionService } from '../questions/services/adaptive-selection.service';

const defaultDepth = 5;
const categoryOrder: TestType[] = [TestType.OCCUPATIONS, TestType.APTITUDES, TestType.PERSONALITY];

@Injectable()
export class ResponsesService {
  private readonly logger = new Logger(ResponsesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly badges: BadgesService,
    private readonly behavioralService: BehavioralAnalysisService,
    private readonly batchService: BatchManagementService,
    private readonly adaptiveService: AdaptiveSelectionService,
  ) {}

  private emptyScores(): Record<RiasecType, number> {
    return { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  }

  private async invalidateResultIfExists(assessmentId: string) {
    const existing = await this.prisma.assessmentResult.findUnique({
      where: { assessmentId },
      select: { id: true },
    });
    if (!existing) return;

    await this.prisma.$transaction([
      this.prisma.assessmentCareerRecommendation.deleteMany({
        where: { resultId: existing.id },
      }),
      this.prisma.treasureMap.deleteMany({
        where: { assessmentId },
      }),
      this.prisma.assessmentResult.delete({
        where: { assessmentId },
      }),
      this.prisma.assessment.update({
        where: { id: assessmentId },
        data: {
          status: TestStatus.IN_PROGRESS,
          completedAt: null,
        },
      }),
    ]);
  }

  private async ensureCategoryPrerequisite(sessionId: string) {
    const assessment = await this.prisma.assessment.findFirst({
      where: {
        sessionId,
        status: TestStatus.COMPLETED,
      },
      select: { id: true },
    });
    if (!assessment) {
      throw new BadRequestException("Le test d'amorce doit être complété avant un test spécifique");
    }
  }

  private capAnsweredByDepth(counts: Record<RiasecType, number>, depth: number) {
    return (Object.keys(counts) as RiasecType[]).reduce((sum, key) => {
      return sum + Math.min(counts[key] ?? 0, depth);
    }, 0);
  }

  private buildCounts(items: Array<{ riasecTypeId: RiasecType }>) {
    const counts = this.emptyScores();
    for (const item of items) {
      counts[item.riasecTypeId] += 1;
    }
    return counts;
  }

  private computeTargetTotal(counts: Record<RiasecType, number>, depth: number) {
    return (Object.keys(counts) as RiasecType[]).reduce((sum, key) => {
      return sum + Math.min(counts[key] ?? 0, depth);
    }, 0);
  }

  private async computeProgress(
    assessmentId: string,
    testVersionId: number,
    depth: number,
    category: TestType,
  ) {
    const questions = await this.prisma.question.findMany({
      where: { isActive: true, testVersionId, category },
      select: { riasecTypeId: true },
    });
    const questionCounts = this.buildCounts(questions);
    const total = this.computeTargetTotal(questionCounts, depth);

    const responses = await this.prisma.response.findMany({
      where: { assessmentId },
      select: { question: { select: { riasecTypeId: true } } },
    });
    const answeredCounts = this.buildCounts(
      responses.map((r) => ({ riasecTypeId: r.question.riasecTypeId })),
    );
    const answered = this.capAnsweredByDepth(answeredCounts, depth);

    return { total, answered };
  }

  async saveResponse(dto: CreateResponsesDto) {
    const { session, assessment } = await resolveSessionAndAssessment(
      this.prisma,
      dto.sessionToken,
      {
        ...(dto.assessmentId !== undefined ? { assessmentId: dto.assessmentId } : {}),
        requireInProgress: true,
      },
    );
    /*if (assessment.type === TestType.FULL) {
      await this.ensureCategoryPrerequisite(session.id);
    }*/

    const questionIds = dto.responses.map((r) => r.questionId);
    const questions = await this.prisma.question.findMany({
      where: {
        id: { in: questionIds },
        testVersionId: assessment.testVersionId,
        isActive: true,
      },
      select: { id: true, category: true, maxValue: true },
    });

    if (questions.length !== questionIds.length) {
      throw new BadRequestException('Certaines questions catégorie sont invalides');
    }

    const questionMap = new Map(questions.map((q) => [q.id, q]));
    const categorySet = new Set(questions.map((q) => q.category));
    if (categorySet.size > 1) {
      throw new BadRequestException(
        'Les réponses catégorie doivent appartenir à une seule category',
      );
    }
    const categoryType = questions[0]?.category ?? null;

    if (!categoryType) {
      throw new BadRequestException('Section de catégorie introuvable');
    }

    if (assessment.currentCategory && assessment.currentCategory !== categoryType) {
      throw new BadRequestException('Section courante invalide pour cette requete');
    }

    if (assessment.type === TestType.GENERALE && categoryType !== TestType.GENERALE) {
      throw new BadRequestException('Section invalide pour ce test');
    }
    if (assessment.type === TestType.OCCUPATIONS && categoryType !== TestType.OCCUPATIONS) {
      throw new BadRequestException('Section invalide pour ce test');
    }
    if (assessment.type === TestType.APTITUDES && categoryType !== TestType.APTITUDES) {
      throw new BadRequestException('Section invalide pour ce test');
    }
    if (assessment.type === TestType.PERSONALITY && categoryType !== TestType.PERSONALITY) {
      throw new BadRequestException('Section invalide pour ce test');
    }

    for (const r of dto.responses) {
      const q = questionMap.get(r.questionId);
      if (!q) throw new BadRequestException('Question catégorie introuvable');
      if (q.category === TestType.APTITUDES) {
        const maxVal = q.maxValue ?? 3;
        if (r.responseValue < 1 || r.responseValue > maxVal) {
          throw new BadRequestException('Valeur aptitude invalide');
        }
      } else if (r.responseValue < 0 || r.responseValue > 1) {
        throw new BadRequestException('Valeur réponse invalide');
      }
    }

    await this.prisma.$transaction(
      dto.responses.map((r) =>
        this.prisma.response.upsert({
          where: {
            assessmentId_questionId: {
              assessmentId: assessment.id,
              questionId: r.questionId,
            },
          },
          update: {
            responseValue: r.responseValue,
            ...(r.responseTimeMs !== undefined ? { responseTimeMs: r.responseTimeMs } : {}),
          },
          create: {
            assessmentId: assessment.id,
            questionId: r.questionId,
            responseValue: r.responseValue,
            ...(r.responseTimeMs !== undefined ? { responseTimeMs: r.responseTimeMs } : {}),
          },
        }),
      ),
    );

    const depth = assessment.depth ?? defaultDepth;
    const sectionProgress = await this.computeProgress(
      assessment.id,
      assessment.testVersionId,
      depth,
      categoryType,
    );
    const sectionCompleted =
      sectionProgress.total > 0 && sectionProgress.answered >= sectionProgress.total;

    const isFull = assessment.type === TestType.FULL;
    let overallProgress = sectionProgress;
    let nextSection: TestType | null = assessment.currentCategory ?? categoryType;
    if (isFull) {
      const totals = await Promise.all(
        categoryOrder.map((category) =>
          this.computeProgress(assessment.id, assessment.testVersionId, depth, category),
        ),
      );
      const totalAll = totals.reduce((sum, item) => sum + item.total, 0);
      const answeredAll = totals.reduce((sum, item) => sum + item.answered, 0);
      overallProgress = { total: totalAll, answered: answeredAll };
      const nextIncomplete = categoryOrder.find((section, idx) => {
        const total = totals[idx];
        return total !== undefined && total.total > 0 && total.answered < total.total;
      });
      nextSection = nextIncomplete ?? categoryType;
    }

    const categoryCompleted =
      overallProgress.total > 0 && overallProgress.answered >= overallProgress.total;
    const completionPercentage = isFull
      ? categoryCompleted
        ? 100
        : 50 + Math.round((overallProgress.answered / Math.max(overallProgress.total, 1)) * 50)
      : Math.round((sectionProgress.answered / Math.max(sectionProgress.total, 1)) * 100);

    await this.prisma.assessment.update({
      where: { id: assessment.id },
      data: {
        status: categoryCompleted ? TestStatus.COMPLETED : TestStatus.IN_PROGRESS,
        ...(categoryCompleted ? { completedAt: new Date() } : {}),
        currentCategory: isFull ? nextSection : categoryType,
        completionPercentage,
        currentStepIndex: overallProgress.answered,
      },
    });

    if (categoryCompleted || sectionCompleted) {
      await this.badges.grantSpecificCompleted(session, assessment.type);
    }

    await this.invalidateResultIfExists(assessment.id);

    return { saved: dto.responses.length, categoryCompleted };
  }

  /**
   * Nouvelle méthode adaptative : soumettre les réponses d'un lot complet
   * Déclenche l'analyse comportementale et le calcul du profil intermédiaire
   */
  async submitBatchResponses(dto: SubmitBatchResponsesDto) {
    // const { session, assessment } = await resolveSessionAndAssessment(
    const { assessment } = await resolveSessionAndAssessment(this.prisma, dto.sessionToken, {
      ...(dto.assessmentId !== undefined ? { assessmentId: dto.assessmentId } : {}),
      requireInProgress: true,
    });

    // Vérifier que le lot existe
    const batch = await this.batchService.getCurrentBatch(assessment.id);
    if (!batch || batch.batchIndex !== dto.batchIndex) {
      throw new BadRequestException(
        `Le lot ${dto.batchIndex} n'est pas le lot actuel ou n'existe pas`,
      );
    }

    // Valider que toutes les questions du lot sont présentes
    const batchQuestionIds = new Set(batch.questionIds);
    const responseQuestionIds = new Set(dto.responses.map((r) => r.questionId));
    const missingQuestions = [...batchQuestionIds].filter((id) => !responseQuestionIds.has(id));

    if (missingQuestions.length > 0) {
      throw new BadRequestException(
        `Réponses manquantes pour les questions: ${missingQuestions.join(', ')}`,
      );
    }

    // Sauvegarder les réponses avec métadonnées comportementales
    const savedResponses: string[] = [];

    // const categoryType = assessment.currentCategory;

    for (const response of dto.responses) {
      const created = await this.prisma.response.upsert({
        where: {
          assessmentId_questionId: {
            assessmentId: assessment.id,
            questionId: response.questionId,
          },
        },
        update: {
          responseValue: response.responseValue,
          ...(response.timeTakenMs !== undefined ? { timeTakenMs: response.timeTakenMs } : {}),
          changeCount: response.changeCount ?? 0,
          metadata: response.metadata ?? {},
        },
        create: {
          assessmentId: assessment.id,
          questionId: response.questionId,
          responseValue: response.responseValue,
          ...(response.timeTakenMs !== undefined ? { timeTakenMs: response.timeTakenMs } : {}),
          changeCount: response.changeCount ?? 0,
          metadata: response.metadata ?? {},
        },
      });

      savedResponses.push(created.id);

      // Analyser le comportement
      if (response.timeTakenMs && response.timeTakenMs > 0) {
        await this.behavioralService.analyzeResponse(
          assessment.id,
          created.id,
          response.timeTakenMs,
          response.changeCount ?? 0,
        );
      }
    }

    // Marquer le lot comme complété
    await this.batchService.completeBatch(assessment.id, dto.batchIndex);

    // Calculer le profil intermédiaire
    const intermediateProfile = await this.adaptiveService.calculateIntermediateProfile(
      assessment.id,
      dto.batchIndex,
    );

    // Invalider les résultats existants
    await this.invalidateResultIfExists(assessment.id);

    // Vérifier si le test est complet
    const totalExpectedQuestions = assessment.depth * 6;
    const totalResponses = await this.prisma.response.count({
      where: { assessmentId: assessment.id },
    });

    const isComplete = totalResponses >= totalExpectedQuestions;
    const completionPercentage = Math.min(
      100,
      Math.round((totalResponses / totalExpectedQuestions) * 100),
    );

    // Mettre à jour l'assessment
    await this.prisma.assessment.update({
      where: { id: assessment.id },
      data: {
        status: isComplete ? TestStatus.COMPLETED : TestStatus.IN_PROGRESS,
        completedAt: isComplete ? new Date() : null,
        completionPercentage,
      },
    });

    return {
      saved: savedResponses.length,
      batchCompleted: true,
      intermediateProfile: {
        batchIndex: intermediateProfile.batchIndex,
        profileData: intermediateProfile.profileData,
        dominantCode: intermediateProfile.profileData
          ? Object.entries(intermediateProfile.profileData)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map((e) => e[0])
              .join('')
          : '',
      },
      testComplete: isComplete,
      completionPercentage,
    };
  }
}
