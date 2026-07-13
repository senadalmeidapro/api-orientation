import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScoringService } from '../scoring/scoring.service';
import { ComputeResultDto } from './dto/compute-result.dto';
import { TestStatus, TestType } from '@prisma/client';
import { BadgesService } from '../badges/badges.service';
import { EnhancedResultsService } from './services/enhanced-results.service';

@Injectable()
export class ResultsService {
  private readonly logger = new Logger(ResultsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scoring: ScoringService,
    private readonly badges: BadgesService,
    private readonly enhancedResults: EnhancedResultsService,
  ) {}

  async compute(dto: ComputeResultDto) {
    const session = await this.prisma.session.findUnique({
      where: { sessionToken: dto.sessionToken },
      select: { id: true },
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

    if (!assessment) {
      throw new NotFoundException('Aucun test disponible pour cette session');
    }

    if (assessment.status !== TestStatus.COMPLETED) {
      throw new BadRequestException('Le test doit être complété avant de calculer le résultat');
    }

    const existing = await this.prisma.assessmentResult.findUnique({
      where: { assessmentId: assessment.id },
    });
    if (existing && !dto.force) {
      if (dto.subjectiveRanking) {
        return this.prisma.assessmentResult.update({
          where: { assessmentId: assessment.id },
          data: {
            subjectiveRanking: dto.subjectiveRanking,
          },
        });
      }
      return existing;
    }

    const generalSource =
      assessment.type === TestType.GENERALE || assessment.type === TestType.FULL
        ? assessment.id
        : await this.prisma.assessment
            .findFirst({
              where: {
                sessionId: session.id,
                type: TestType.GENERALE,
                status: TestStatus.COMPLETED,
              },
              orderBy: { completedAt: 'desc' },
              select: { id: true },
            })
            .then((item) => item?.id);

    const categories =
      assessment.type === TestType.FULL
        ? [TestType.OCCUPATIONS, TestType.APTITUDES, TestType.PERSONALITY]
        : assessment.type === TestType.GENERALE
          ? []
          : [assessment.type];

    const scores = await this.scoring.computeScores(assessment.id, {
      generalAssessmentId: generalSource ?? null,
      categories,
    });
    const riasecCode = scores.specificCode ?? scores.generalCode;

    const result = await this.prisma.assessmentResult.upsert({
      where: { assessmentId: assessment.id },
      update: {
        riasecCode,
        scoresByCategory: {
          ...scores.sectionScores,
          GENERALE: scores.generalScores,
          totalRaw: scores.specificScores,
          totalNormalized: scores.specificNormalizedScores,
        },
        consistencyScore: scores.consistencyScore,
        consistencyLevel: scores.consistencyLevel,
        differentiationScore: scores.differentiationScore,
        profileStrength: scores.profileStrength,
        strengths: scores.strengths,
        ...(dto.subjectiveRanking !== undefined
          ? { subjectiveRanking: dto.subjectiveRanking }
          : {}),
      },
      create: {
        assessmentId: assessment.id,
        riasecCode,
        scoresByCategory: {
          ...scores.sectionScores,
          GENERALE: scores.generalScores,
          totalRaw: scores.specificScores,
          totalNormalized: scores.specificNormalizedScores,
        },
        consistencyScore: scores.consistencyScore,
        consistencyLevel: scores.consistencyLevel,
        differentiationScore: scores.differentiationScore,
        profileStrength: scores.profileStrength,
        strengths: scores.strengths,
        ...(dto.subjectiveRanking !== undefined
          ? { subjectiveRanking: dto.subjectiveRanking }
          : {}),
      },
    });

    if (assessment.type !== TestType.GENERALE) {
      await this.badges.grantTestCompleted(session);
    }

    return result;
  }

  async getBySessionId(sessionId: string) {
    const result = await this.prisma.assessmentResult.findFirst({
      where: { assessment: { sessionId } },
      orderBy: { createdAt: 'desc' },
      include: { careerRecommendations: true },
    });
    if (!result) throw new NotFoundException('Résultat introuvable');
    return this.touchResult(result.assessmentId);
  }

  async getByToken(sessionToken: string) {
    const session = await this.prisma.session.findUnique({
      where: { sessionToken },
      select: { id: true },
    });
    if (!session) throw new NotFoundException('Session introuvable');
    return this.getBySessionId(session.id);
  }

  async getByAssessmentId(assessmentId: string) {
    const result = await this.prisma.assessmentResult.findUnique({
      where: { assessmentId },
      include: { careerRecommendations: true },
    });
    if (!result) throw new NotFoundException('Résultat introuvable');
    return this.touchResult(assessmentId);
  }

  private async touchResult(assessmentId: string) {
    return this.prisma.assessmentResult.update({
      where: { assessmentId },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
      include: { careerRecommendations: true },
    });
  }

  /**
   * Nouvelle méthode : Générer un rapport enrichi avec analyses comportementales
   */
  async computeEnhancedResult(assessmentId: string) {
    // S'assurer que le résultat de base existe
    const baseResult = await this.prisma.assessmentResult.findUnique({
      where: { assessmentId },
    });

    if (!baseResult) {
      throw new NotFoundException(
        "Résultat de base non trouvé. Calculez d'abord le résultat standard.",
      );
    }

    // Générer le rapport enrichi
    return await this.enhancedResults.generateEnhancedReport(assessmentId);
  }

  /**
   * Récupérer les observations comportementales pour un assessment
   */
  async getBehavioralObservations(assessmentId: string) {
    return await this.enhancedResults.formatBehavioralObservations(assessmentId);
  }
}
