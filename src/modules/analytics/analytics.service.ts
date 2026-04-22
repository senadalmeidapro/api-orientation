import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, AssessmentStatus, FeedbackType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
    AnalyticsSummaryDto,
    CreateFeedbackDto,
    CreateInteractionDto,
    CreateOutcomeDto,
} from './dto';

@Injectable()
export class AnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);

    constructor(private readonly prisma: PrismaService) {}

    private parseDate(value?: string) {
        if (!value) return undefined;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            throw new BadRequestException('Date invalide');
        }
        return date;
    }

    private buildDateTimeFilter(from?: Date, to?: Date) {
        const filter: { gte?: Date; lte?: Date } = {};
        if (from !== undefined) filter.gte = from;
        if (to !== undefined) filter.lte = to;
        return Object.keys(filter).length > 0 ? filter : undefined;
    }

    private async resolveAssessment(sessionToken: string, assessmentId?: string) {
        const session = await this.prisma.session.findUnique({
            where: { sessionToken },
            select: { id: true },
        });
        if (!session) throw new NotFoundException('Session introuvable');

        const assessment = assessmentId
            ? await this.prisma.assessment.findFirst({
                  where: { id: assessmentId, sessionId: session.id },
              })
            : await this.prisma.assessment.findFirst({
                  where: {
                      sessionId: session.id,
                      status: AssessmentStatus.COMPLETED,
                  },
                  orderBy: { completedAt: 'desc' },
              });

        if (!assessment) throw new NotFoundException('Assessment introuvable');
        return { session, assessment };
    }

    async createInteraction(dto: CreateInteractionDto) {
        const { assessment } = await this.resolveAssessment(dto.sessionToken, dto.assessmentId);
        return this.prisma.assessmentInteraction.create({
            data: {
                assessmentId: assessment.id,
                type: dto.type,
                entityType: dto.entityType,
                entityId: dto.entityId,
                value: dto.value ?? null,
                metadata: dto.metadata ? (dto.metadata as Prisma.InputJsonValue) : {},
            },
        });
    }

    async createFeedback(dto: CreateFeedbackDto) {
        const { assessment } = await this.resolveAssessment(dto.sessionToken, dto.assessmentId);
        return this.prisma.assessmentFeedback.create({
            data: {
                assessmentId: assessment.id,
                recommendationId: dto.recommendationId ?? null,
                type: dto.type,
                value: dto.value,
                context: dto.context ? (dto.context as Prisma.InputJsonValue) : {},
            },
        });
    }

    async createOutcome(dto: CreateOutcomeDto) {
        const { assessment } = await this.resolveAssessment(dto.sessionToken, dto.assessmentId);
        return this.prisma.assessmentOutcome.create({
            data: {
                assessmentId: assessment.id,
                careerId: dto.careerId,
                status: dto.status,
                sector: dto.sector,
                salaryRange: dto.salaryRange ?? null,
                delayToOutcome: dto.delayToOutcome,
            },
        });
    }

    async getSummary(dto: AnalyticsSummaryDto) {
        const from = this.parseDate(dto.from);
        const to = this.parseDate(dto.to);
        const createdAtFilter = this.buildDateTimeFilter(from, to);
        const completedAtFilter = this.buildDateTimeFilter(from, to);
        const dateFilter = createdAtFilter ? { createdAt: createdAtFilter } : {};
        const limit = dto.limit ?? 10;

        const [assessmentsCompleted, sessionsTotal, topCareers, feedbacks] =
            await this.prisma.$transaction([
                this.prisma.assessment.count({
                    where: {
                        status: AssessmentStatus.COMPLETED,
                        ...(completedAtFilter ? { completedAt: completedAtFilter } : {}),
                    },
                }),
                this.prisma.session.count({
                    where: createdAtFilter ? { createdAt: createdAtFilter } : {},
                }),
                this.prisma.assessmentCareerRecommendation.groupBy({
                    by: ['careerId'],
                    _count: { careerId: true },
                    orderBy: { _count: { careerId: 'desc' } },
                    take: limit,
                    where: dateFilter,
                }),
                this.prisma.assessmentFeedback.groupBy({
                    by: ['type'],
                    _count: { type: true },
                    orderBy: { _count: { type: 'desc' } },
                    where: dateFilter,
                }),
            ]);

        const careerIds = topCareers.map((c) => c.careerId);
        const careers = await this.prisma.career.findMany({
            where: { id: { in: careerIds } },
            select: { id: true, name: true },
        });
        const careerMap = new Map(careers.map((c) => [c.id, c.name]));

        const feedbackSummary = feedbacks.reduce<Record<FeedbackType, number>>(
            (acc, item) => {
                acc[item.type] = (item._count as { type: number })?.type ?? 0;
                return acc;
            },
            {} as Record<FeedbackType, number>,
        );
        return {
            sessionsTotal,
            assessmentsCompleted,
            topCareers: topCareers.map((item) => ({
                careerId: item.careerId,
                name: careerMap.get(item.careerId) ?? 'Unknown',
                count: (item._count as { careerId: number })?.careerId ?? 0,
            })),
            feedbackSummary,
        };
    }
}
