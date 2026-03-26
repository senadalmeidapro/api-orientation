import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePhase1ResponsesDto } from './dto/create-phase1-responses.dto';
import { CreatePhase2ResponsesDto } from './dto/create-phase2-responses.dto';
import { PhaseType, SectionType } from '@prisma/client';
import { BadgesService } from '../badges/badges.service';

@Injectable()
export class ResponsesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly badges: BadgesService,
    ) {
    }

    private async invalidateResultIfExists(sessionId: string) {
        const existing = await this.prisma.userResult.findUnique({
            where: { sessionId },
            select: { id: true },
        });
        if (!existing) return;

        await this.prisma.$transaction([
            this.prisma.userCareerRecommendation.deleteMany({
                where: { resultId: existing.id },
            }),
            this.prisma.treasureMap.deleteMany({
                where: { sessionId },
            }),
            this.prisma.userResult.delete({
                where: { sessionId },
            }),
            this.prisma.userTestSession.update({
                where: { id: sessionId },
                data: {
                    completedAt: null,
                    phase3CompletedAt: null,
                },
            }),
        ]);
    }

    async savePhase1(dto: CreatePhase1ResponsesDto) {
        const session = await this.prisma.userTestSession.findUnique({
            where: { sessionToken: dto.sessionToken },
        });
        if (!session) throw new NotFoundException('Session introuvable');

        if (session.currentPhase !== PhaseType.PHASE_1) {
            throw new BadRequestException('Phase 1 déjà terminée ou session en phase suivante');
        }

        const questionIds = dto.responses.map((r) => r.questionId);
        const questions = await this.prisma.phase1Question.findMany({
            where: {
                id: { in: questionIds },
                testVersionId: session.testVersionId,
                isActive: true,
            },
            select: { id: true },
        });

        if (questions.length !== questionIds.length) {
            throw new BadRequestException('Certaines questions Phase 1 sont invalides');
        }

        await this.prisma.$transaction(
            dto.responses.map((r) =>
                this.prisma.phase1Response.upsert({
                    where: {
                        sessionId_questionId: {
                            sessionId: session.id,
                            questionId: r.questionId,
                        },
                    },
                    update: {
                        responseValue: r.responseValue,
                        responseTimeMs: r.responseTimeMs ?? undefined,
                    },
                    create: {
                        sessionId: session.id,
                        questionId: r.questionId,
                        responseValue: r.responseValue,
                        responseTimeMs: r.responseTimeMs ?? undefined,
                    },
                }),
            ),
        );

        const totalQuestions = await this.prisma.phase1Question.count({
            where: { isActive: true, testVersionId: session.testVersionId },
        });
        const answered = await this.prisma.phase1Response.count({
            where: { sessionId: session.id },
        });

        const phase1Completed = totalQuestions > 0 && answered >= totalQuestions;

        await this.prisma.userTestSession.update({
            where: { id: session.id },
            data: {
                phase1CompletedAt: phase1Completed ? new Date() : undefined,
                currentPhase: phase1Completed ? PhaseType.PHASE_2 : PhaseType.PHASE_1,
                completionPercentage: phase1Completed
                    ? 50
                    : Math.round((answered / Math.max(totalQuestions, 1)) * 50),
            },
        });

        if (phase1Completed) {
            await this.badges.grantPhase1Completed(session);
        }

        await this.invalidateResultIfExists(session.id);

        return { saved: dto.responses.length, phase1Completed };
    }

    async savePhase2(dto: CreatePhase2ResponsesDto) {
        const session = await this.prisma.userTestSession.findUnique({
            where: { sessionToken: dto.sessionToken },
        });
        if (!session) throw new NotFoundException('Session introuvable');

        if (session.currentPhase === PhaseType.PHASE_1) {
            throw new BadRequestException('La phase 1 doit être complétée avant la phase 2');
        }
        if (!session.phase1CompletedAt) {
            throw new BadRequestException('Phase 1 non complétée');
        }
        if (session.currentPhase === PhaseType.PHASE_3) {
            throw new BadRequestException('La phase 2 est déjà terminée');
        }

        const questionIds = dto.responses.map((r) => r.questionId);
        const questions = await this.prisma.phase2Question.findMany({
            where: {
                id: { in: questionIds },
                testVersionId: session.testVersionId,
                isActive: true,
            },
            select: { id: true, sectionType: true, maxValue: true },
        });

        if (questions.length !== questionIds.length) {
            throw new BadRequestException('Certaines questions Phase 2 sont invalides');
        }

        const questionMap = new Map(questions.map((q) => [q.id, q]));
        const sectionSet = new Set(questions.map((q) => q.sectionType));
        if (sectionSet.size > 1) {
            throw new BadRequestException(
                'Les réponses Phase 2 doivent appartenir à une seule section',
            );
        }
        const sectionType = questions[0]?.sectionType ?? null;

        for (const r of dto.responses) {
            const q = questionMap.get(r.questionId);
            if (!q) throw new BadRequestException('Question Phase 2 introuvable');
            if (q.sectionType === SectionType.APTITUDES) {
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
                this.prisma.phase2Response.upsert({
                    where: {
                        sessionId_questionId: {
                            sessionId: session.id,
                            questionId: r.questionId,
                        },
                    },
                    update: {
                        responseValue: r.responseValue,
                        responseTimeMs: r.responseTimeMs ?? undefined,
                    },
                    create: {
                        sessionId: session.id,
                        questionId: r.questionId,
                        responseValue: r.responseValue,
                        responseTimeMs: r.responseTimeMs ?? undefined,
                    },
                }),
            ),
        );

        const totalQuestions = await this.prisma.phase2Question.count({
            where: { isActive: true, testVersionId: session.testVersionId },
        });
        const answered = await this.prisma.phase2Response.count({
            where: { sessionId: session.id },
        });

        const phase2Completed = totalQuestions > 0 && answered >= totalQuestions;

        await this.prisma.userTestSession.update({
            where: { id: session.id },
            data: {
                phase2CompletedAt: phase2Completed ? new Date() : undefined,
                currentPhase: phase2Completed ? PhaseType.PHASE_3 : PhaseType.PHASE_2,
                currentSection: sectionType,
                completionPercentage: phase2Completed
                    ? 100
                    : 50 + Math.round((answered / Math.max(totalQuestions, 1)) * 50),
            },
        });

        if (phase2Completed) {
            await this.badges.grantPhase2Completed(session);
        }

        await this.invalidateResultIfExists(session.id);

        return { saved: dto.responses.length, phase2Completed };
    }
}
