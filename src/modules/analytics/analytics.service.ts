import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    constructor(private readonly prisma: PrismaService) {}

    private parseDate(value?: string) {
        if (!value) return undefined;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            throw new BadRequestException('Date invalide');
        }
        return date;
    }

    private async resolveAssessment(sessionToken: string, assessmentId?: string) {
        const session = await this.prisma.session.findUnique({
            where: { session_token: sessionToken },
            select: { id: true },
        });
        if (!session) throw new NotFoundException('Session introuvable');

        const assessment = assessmentId
            ? await this.prisma.assessment.findFirst({
                  where: { id: assessmentId, session_id: session.id },
              })
            : await this.prisma.assessment.findFirst({
                  where: {
                      session_id: session.id,
                      status: AssessmentStatus.COMPLETED,
                  },
                  orderBy: { completed_at: 'desc' },
              });

        if (!assessment) throw new NotFoundException('Assessment introuvable');
        return { session, assessment };
    }

    async createInteraction(dto: CreateInteractionDto) {
        const { assessment } = await this.resolveAssessment(dto.sessionToken, dto.assessmentId);
        return this.prisma.assessmentInteraction.create({
            data: {
                assessment_id: assessment.id,
                type: dto.type,
                entity_type: dto.entityType,
                entity_id: dto.entityId,
                value: dto.value,
                metadata: dto.metadata ? (dto.metadata as Prisma.InputJsonObject) : undefined,
            },
        });
    }

    async createFeedback(dto: CreateFeedbackDto) {
        const { assessment } = await this.resolveAssessment(dto.sessionToken, dto.assessmentId);
        return this.prisma.assessmentFeedback.create({
            data: {
                assessment_id: assessment.id,
                recommendationId: dto.recommendationId,
                type: dto.type,
                value: dto.value,
                context: dto.context ? (dto.context as Prisma.InputJsonObject) : undefined,
            },
        });
    }

    async createOutcome(dto: CreateOutcomeDto) {
        const { assessment } = await this.resolveAssessment(dto.sessionToken, dto.assessmentId);
        return this.prisma.assessmentOutcome.create({
            data: {
                assessment_id: assessment.id,
                career_id: dto.careerId,
                status: dto.status,
                sector: dto.sector,
                salary_range: dto.salaryRange,
                delay_to_outcome: dto.delayToOutcome,
            },
        });
    }

    async getSummary(dto: AnalyticsSummaryDto) {
        const from = this.parseDate(dto.from);
        const to = this.parseDate(dto.to);
        const dateFilter = from || to ? { created_at: { gte: from, lte: to } } : {};
        const limit = dto.limit ?? 10;

        const [assessmentsCompleted, sessionsTotal, topCareers, feedbacks] =
            await this.prisma.$transaction([
                this.prisma.assessment.count({
                    where: {
                        status: AssessmentStatus.COMPLETED,
                        ...(from || to ? { completed_at: { gte: from, lte: to } } : {}),
                    },
                }),
                this.prisma.session.count({
                    where: from || to ? { created_at: { gte: from, lte: to } } : {},
                }),
                this.prisma.assessmentCareerRecommendation.groupBy({
                    by: ['career_id'],
                    _count: { career_id: true },
                    orderBy: { _count: { career_id: 'desc' } },
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

        const careerIds = topCareers.map((c) => c.career_id);
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
                careerId: item.career_id,
                name: careerMap.get(item.career_id) ?? 'Unknown',
                count: (item._count as { career_id: number })?.career_id ?? 0,
            })),
            feedbackSummary,
        };
    }
}
