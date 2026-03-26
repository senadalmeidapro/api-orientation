import { Injectable } from '@nestjs/common';
import { InteractionEntityType, InteractionEventType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AdaptiveQueueService } from './adaptive-queue.service';

@Injectable()
export class InteractionEventsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly queue: AdaptiveQueueService,
    ) {
    }

    async recordEvent(input: {
        userId: string;
        type: InteractionEventType;
        entityType: InteractionEntityType;
        entityId: number;
        value?: number;
        metadata?: Prisma.InputJsonValue;
    }) {
        await this.recordEvents(input.userId, [input]);
    }

    async recordEvents(
        userId: string,
        events: Array<{
            type: InteractionEventType;
            entityType: InteractionEntityType;
            entityId: number;
            value?: number;
            metadata?: Prisma.InputJsonValue;
        }>,
    ) {
        if (!events.length) return;
        await this.prisma.interactionEvent.createMany({
            data: events.map((event) => ({
                userId,
                type: event.type,
                entityType: event.entityType,
                entityId: event.entityId,
                value: event.value ?? undefined,
                metadata: event.metadata ?? undefined,
            })),
        });

        this.queue.enqueueRecompute(userId);
    }

    async recordAnswerEvents(
        userId: string,
        responses: Array<{
            questionId: number;
            responseValue: number;
            responseTimeMs?: number;
            metadata?: Prisma.InputJsonValue;
        }>,
    ) {
        if (!responses.length) return;

        await this.prisma.interactionEvent.createMany({
            data: responses.map((response) => {
                const metadata: Prisma.InputJsonValue = {
                    responseValue: response.responseValue,
                    ...(response.responseTimeMs ? { responseTimeMs: response.responseTimeMs } : {}),
                    ...(response.metadata ? { extra: response.metadata } : {}),
                };
                return {
                    userId,
                    type: InteractionEventType.ANSWER,
                    entityType: InteractionEntityType.QUESTION,
                    entityId: response.questionId,
                    value: response.responseTimeMs ?? undefined,
                    metadata,
                };
            }),
        });

        this.queue.enqueueRecompute(userId);
    }
}
