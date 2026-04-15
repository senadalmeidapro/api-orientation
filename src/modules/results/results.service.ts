import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScoringService } from '../scoring/scoring.service';
import { ComputeResultDto } from './dto/compute-result.dto';
import { AssessmentStatus, AssessmentType, Phase2Type, Prisma } from '@prisma/client';
import { BadgesService } from '../badges/badges.service';
import { EnhancedResultsService } from './services/enhanced-results.service';

@Injectable()
export class ResultsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly scoring: ScoringService,
        private readonly badges: BadgesService,
        private readonly enhancedResults: EnhancedResultsService,
    ) {}

    async compute(dto: ComputeResultDto) {
        const session = await this.prisma.session.findUnique({
            where: { session_token: dto.sessionToken },
            select: { id: true },
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

        if (!assessment) {
            throw new NotFoundException('Aucun test disponible pour cette session');
        }

        if (assessment.status !== AssessmentStatus.COMPLETED) {
            throw new BadRequestException(
                'Le test doit être complété avant de calculer le résultat',
            );
        }

        const existing = await this.prisma.assessmentResult.findUnique({
            where: { assessment_id: assessment.id },
        });
        if (existing && !dto.force) {
            if (dto.subjectiveRanking) {
                return this.prisma.assessmentResult.update({
                    where: { assessment_id: assessment.id },
                    data: {
                        subjective_ranking: dto.subjectiveRanking as Prisma.InputJsonObject,
                    },
                });
            }
            return existing;
        }

        const phase1Source =
            assessment.type === AssessmentType.PHASE1 || assessment.type === AssessmentType.FULL
                ? assessment.id
                : await this.prisma.assessment
                      .findFirst({
                          where: {
                              session_id: session.id,
                              type: AssessmentType.PHASE1,
                              status: AssessmentStatus.COMPLETED,
                          },
                          orderBy: { completed_at: 'desc' },
                          select: { id: true },
                      })
                      .then((item) => item?.id);

        const phase2Types =
            assessment.type === AssessmentType.PHASE2_OCCUPATIONS
                ? [Phase2Type.OCCUPATIONS]
                : assessment.type === AssessmentType.PHASE2_APTITUDES
                  ? [Phase2Type.APTITUDES]
                  : assessment.type === AssessmentType.PHASE2_PERSONALITY
                    ? [Phase2Type.PERSONALITY]
                    : assessment.type === AssessmentType.FULL
                      ? [Phase2Type.OCCUPATIONS, Phase2Type.APTITUDES, Phase2Type.PERSONALITY]
                      : [];

        const scores = await this.scoring.computeScores(assessment.id, {
            phase1AssessmentId: phase1Source,
            phase2Types,
        });

        const result = await this.prisma.assessmentResult.upsert({
            where: { assessment_id: assessment.id },
            update: {
                phase1_code: scores.phase1Code,
                phase2_code: scores.phase2Code,
                phase1_scores: scores.phase1Scores,
                phase2_scores: scores.phase2Scores,
                section_scores: {
                    ...scores.sectionScores,
                    totalRaw: scores.phase2Scores,
                    totalNormalized: scores.phase2NormalizedScores,
                },
                consistency_score: scores.consistencyScore,
                consistency_level: scores.consistencyLevel,
                differentiation_score: scores.differentiationScore,
                profile_strength: scores.profileStrength,
                strengths: scores.strengths,
                subjective_ranking: dto.subjectiveRanking ?? undefined,
            },
            create: {
                assessment_id: assessment.id,
                phase1_code: scores.phase1Code,
                phase2_code: scores.phase2Code,
                phase1_scores: scores.phase1Scores,
                phase2_scores: scores.phase2Scores,
                section_scores: {
                    ...scores.sectionScores,
                    totalRaw: scores.phase2Scores,
                    totalNormalized: scores.phase2NormalizedScores,
                },
                consistency_score: scores.consistencyScore,
                consistency_level: scores.consistencyLevel,
                differentiation_score: scores.differentiationScore,
                profile_strength: scores.profileStrength,
                strengths: scores.strengths,
                subjective_ranking: dto.subjectiveRanking ?? undefined,
            },
        });

        if (assessment.type !== AssessmentType.PHASE1) {
            await this.badges.grantTestCompleted(session);
        }

        return result;
    }

    async getBySessionId(sessionId: string) {
        const result = await this.prisma.assessmentResult.findFirst({
            where: { assessment: { session_id: sessionId } },
            orderBy: { created_at: 'desc' },
            include: { career_recommendations: true },
        });
        if (!result) throw new NotFoundException('Résultat introuvable');
        return this.touchResult(result.assessment_id);
    }

    async getByToken(sessionToken: string) {
        const session = await this.prisma.session.findUnique({
            where: { session_token: sessionToken },
            select: { id: true },
        });
        if (!session) throw new NotFoundException('Session introuvable');
        return this.getBySessionId(session.id);
    }

    async getByAssessmentId(assessmentId: string) {
        const result = await this.prisma.assessmentResult.findUnique({
            where: { assessment_id: assessmentId },
            include: { career_recommendations: true },
        });
        if (!result) throw new NotFoundException('Résultat introuvable');
        return this.touchResult(assessmentId);
    }

    private async touchResult(assessmentId: string) {
        return this.prisma.assessmentResult.update({
            where: { assessment_id: assessmentId },
            data: {
                view_sount: { increment: 1 },
                lastViewed_at: new Date(),
            },
            include: { career_recommendations: true },
        });
    }

    /**
     * Nouvelle méthode : Générer un rapport enrichi avec analyses comportementales
     */
    async computeEnhancedResult(assessmentId: string) {
        // S'assurer que le résultat de base existe
        const baseResult = await this.prisma.assessmentResult.findUnique({
            where: { assessment_id: assessmentId },
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
