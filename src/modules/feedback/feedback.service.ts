import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { ListFeedbackDto } from './dto/list-feedback.dto';
import { InputJsonValue } from '@prisma/client/runtime/client';
import { FeedbackType, InteractionEntityType, InteractionEventType } from '@prisma/client';
import { InteractionEventsService } from '../adaptive/interaction-events.service';

@Injectable()
export class FeedbackService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly interactionEvents: InteractionEventsService,
    ) {
    }

    private parseRange(dto: { from?: string; to?: string }) {
        const from = dto.from ? new Date(dto.from) : undefined;
        const to = dto.to ? new Date(dto.to) : undefined;
        if (from && Number.isNaN(from.getTime()))
            throw new BadRequestException('Date from invalide');
        if (to && Number.isNaN(to.getTime())) throw new BadRequestException('Date to invalide');
        return { from, to };
    }

    private async resolveSessionId(sessionId: string | undefined, userId: string) {
        if (!sessionId) return undefined;
        const session = await this.prisma.userTestSession.findUnique({
            where: { id: sessionId },
            select: { id: true, userId: true },
        });
        if (!session) throw new NotFoundException('Session introuvable');
        if (session.userId && session.userId !== userId) {
            throw new BadRequestException('Session invalide');
        }
        return session.id;
    }

    private async resolveRecommendation(recommendationId: number | undefined, userId: string) {
        if (!recommendationId) return undefined;
        const recommendation = await this.prisma.userCareerRecommendation.findUnique({
            where: { id: recommendationId },
            select: {
                id: true,
                careerId: true,
                result: {
                    select: {
                        sessionId: true,
                        session: { select: { userId: true } },
                    },
                },
            },
        });
        if (!recommendation) throw new NotFoundException('Recommandation introuvable');
        const recommendationUserId = recommendation.result.session.userId;
        if (recommendationUserId && recommendationUserId !== userId) {
            throw new BadRequestException('Recommandation invalide');
        }
        return recommendation;
    }

    private mapFeedbackType(type: FeedbackType) {
        switch (type) {
            case FeedbackType.CLICK:
                return InteractionEventType.CLICK;
            case FeedbackType.VIEW:
                return InteractionEventType.VIEW;
            case FeedbackType.SKIP:
                return InteractionEventType.SKIP;
            case FeedbackType.LIKE:
                return InteractionEventType.CLICK;
            case FeedbackType.DISLIKE:
                return InteractionEventType.SKIP;
        }
    }

    async create(dto: CreateFeedbackDto, userId?: string) {
        if (!userId) throw new BadRequestException('Utilisateur requis');

        const sessionId = await this.resolveSessionId(dto.sessionId, userId);
        const recommendation = await this.resolveRecommendation(dto.recommendationId, userId);

        if (sessionId && recommendation && recommendation.result.sessionId !== sessionId) {
            throw new BadRequestException('Session incohérente avec la recommandation');
        }

        const feedback = await this.prisma.userFeedback.create({
            data: {
                userId,
                sessionId: sessionId ?? recommendation?.result.sessionId ?? undefined,
                recommendationId: recommendation?.id ?? undefined,
                type: dto.type,
                value: dto.value,
                context: dto.context ? (dto.context as InputJsonValue) : undefined,
            },
        });

        if (recommendation) {
            const events: Array<{
                type: InteractionEventType;
                entityType: InteractionEntityType;
                entityId: number;
                value?: number;
                metadata?: InputJsonValue;
            }> = [
                {
                    type: this.mapFeedbackType(dto.type),
                    entityType: InteractionEntityType.RECOMMENDATION,
                    entityId: recommendation.id,
                    value: dto.value,
                    metadata: {
                        feedbackType: dto.type,
                        careerId: recommendation.careerId,
                        sessionId: recommendation.result.sessionId,
                    },
                },
            ];

            if (
                recommendation.careerId &&
                (dto.type === FeedbackType.CLICK || dto.type === FeedbackType.LIKE)
            ) {
                events.push({
                    type: InteractionEventType.CLICK,
                    entityType: InteractionEntityType.CAREER,
                    entityId: recommendation.careerId,
                    value: dto.value,
                    metadata: {
                        source: 'recommendation',
                        recommendationId: recommendation.id,
                    },
                });
            }

            await this.interactionEvents.recordEvents(userId, events);
        }

        return feedback;
    }

    async list(dto: ListFeedbackDto) {
        const where: any = {};
        if (dto.userId) where.userId = dto.userId;
        if (dto.sessionId) where.sessionId = dto.sessionId;
        if (dto.recommendationId) where.recommendationId = dto.recommendationId;
        if (dto.type) where.type = dto.type;
        if (dto.from || dto.to) {
            const { from, to } = this.parseRange(dto);
            where.createdAt = {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
            };
        }

        const limit = Math.min(dto.limit ?? 100, 500);
        return this.prisma.userFeedback.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    health() {
        return { status: 'ok', module: 'feedback' };
    }
}
