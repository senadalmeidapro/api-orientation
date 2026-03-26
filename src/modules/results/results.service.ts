import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScoringService } from '../scoring/scoring.service';
import { ComputeResultDto } from './dto/compute-result.dto';
import { PhaseType } from '@prisma/client';
import { BadgesService } from '../badges/badges.service';

@Injectable()
export class ResultsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly scoring: ScoringService,
        private readonly badges: BadgesService,
    ) {
    }

    async compute(dto: ComputeResultDto) {
        const session = await this.prisma.userTestSession.findUnique({
            where: { sessionToken: dto.sessionToken },
        });
        if (!session) throw new NotFoundException('Session introuvable');
        if (!session.phase1CompletedAt || !session.phase2CompletedAt) {
            throw new BadRequestException(
                'Le test doit être complété avant de calculer le résultat',
            );
        }

        const scores = await this.scoring.computeScores(session.id);

        const result = await this.prisma.userResult.upsert({
            where: { sessionId: session.id },
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
                sessionId: session.id,
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

        await this.prisma.userTestSession.update({
            where: { id: session.id },
            data: {
                currentPhase: PhaseType.PHASE_3,
                completionPercentage: 100,
                completedAt: new Date(),
                phase3CompletedAt: new Date(),
            },
        });

        await this.badges.grantTestCompleted(session);

        return result;
    }

    async getBySessionId(sessionId: string) {
        const result = await this.prisma.userResult.findUnique({
            where: { sessionId },
            include: { careerRecommendations: true },
        });
        if (!result) throw new NotFoundException('Résultat introuvable');
        await this.prisma.userResult.update({
            where: { sessionId },
            data: {
                viewCount: { increment: 1 },
                lastViewedAt: new Date(),
            },
        });
        return result;
    }

    async getByToken(sessionToken: string) {
        const session = await this.prisma.userTestSession.findUnique({
            where: { sessionToken },
            select: { id: true },
        });
        if (!session) throw new NotFoundException('Session introuvable');
        return this.getBySessionId(session.id);
    }
}
