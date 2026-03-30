import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScoringService } from '../scoring/scoring.service';
import { ComputeResultDto } from './dto/compute-result.dto';
import { AssessmentStatus, AssessmentType, Phase2Type } from '@prisma/client';
import { BadgesService } from '../badges/badges.service';

@Injectable()
export class ResultsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly scoring: ScoringService,
        private readonly badges: BadgesService,
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
                  where: { sessionId: session.id, status: AssessmentStatus.COMPLETED },
                  orderBy: { completedAt: 'desc' },
              });

        if (!assessment) {
            throw new NotFoundException('Aucun test disponible pour cette session');
        }

        if (assessment.status !== AssessmentStatus.COMPLETED) {
            throw new BadRequestException(
                'Le test doit être complété avant de calculer le résultat',
            );
        }

        const phase1Source =
            assessment.type === AssessmentType.PHASE1 || assessment.type === AssessmentType.FULL
                ? assessment.id
                : await this.prisma.assessment
                      .findFirst({
                          where: {
                              sessionId: session.id,
                              type: AssessmentType.PHASE1,
                              status: AssessmentStatus.COMPLETED,
                          },
                          orderBy: { completedAt: 'desc' },
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
            where: { assessmentId: assessment.id },
            update: {
                phase1Code: scores.phase1Code,
                phase2Code: scores.phase2Code,
                phase1Scores: scores.phase1Scores,
                phase2Scores: scores.phase2Scores,
                sectionScores: {
                    ...scores.sectionScores,
                    totalRaw: scores.phase2Scores,
                    totalNormalized: scores.phase2NormalizedScores,
                },
                consistencyScore: scores.consistencyScore,
                consistencyLevel: scores.consistencyLevel,
                differentiationScore: scores.differentiationScore,
                profileStrength: scores.profileStrength,
                strengths: scores.strengths,
                subjectiveRanking: dto.subjectiveRanking ?? undefined,
            },
            create: {
                assessmentId: assessment.id,
                phase1Code: scores.phase1Code,
                phase2Code: scores.phase2Code,
                phase1Scores: scores.phase1Scores,
                phase2Scores: scores.phase2Scores,
                sectionScores: {
                    ...scores.sectionScores,
                    totalRaw: scores.phase2Scores,
                    totalNormalized: scores.phase2NormalizedScores,
                },
                consistencyScore: scores.consistencyScore,
                consistencyLevel: scores.consistencyLevel,
                differentiationScore: scores.differentiationScore,
                profileStrength: scores.profileStrength,
                strengths: scores.strengths,
                subjectiveRanking: dto.subjectiveRanking ?? undefined,
            },
        });

        if (assessment.type !== AssessmentType.PHASE1) {
            await this.badges.grantTestCompleted(session);
        }

        return result;
    }

    async getBySessionId(sessionId: number) {
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
}
