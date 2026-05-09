import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BehavioralUtil, BehavioralIndicatorData } from '@common/utils/behavioral.util';

export interface BehavioralMetrics {
    averageResponseTime: number;
    responseTimeStdDev: number;
    totalChanges: number;
    hesitationCount: number;
    doubtCount: number;
    excitementCount: number;
    consistentCount: number;
}

export interface BehavioralInsights {
    dominantPattern: string;
    confidence: number;
    observations: string[];
    recommendations: string[];
    metrics: BehavioralMetrics;
}

@Injectable()
export class BehavioralAnalysisService {
    private readonly logger = new Logger(BehavioralAnalysisService.name);

    constructor(private readonly prisma: PrismaService) {}

    async analyzeResponse(
        assessmentId: string,
        responseId: string,
        timeTakenMs: number,
        changeCount: number,
    ): Promise<BehavioralIndicatorData[]> {
        const avgTime = await this.calculateAverageResponseTime(assessmentId);

        const indicators = BehavioralUtil.analyzeResponse(timeTakenMs, changeCount, avgTime);

        for (const indicator of indicators) {
            await this.recordIndicator(assessmentId, responseId, indicator);
        }

        return indicators;
    }

    async recordIndicator(
        assessmentId: string,
        responseId: string,
        indicator: BehavioralIndicatorData,
    ): Promise<void> {
        await this.prisma.behavioralIndicator.create({
            data: {
                assessmentId,
                responseId,
                indicatorType: indicator.type,
                timeTakenMs: indicator.timeTakenMs ?? null,
                changeCount: indicator.changeCount ?? 0,
                metadata: indicator.metadata ?? {},
            },
        });
    }

    async getAssessmentBehaviors(assessmentId: string): Promise<BehavioralIndicatorData[]> {
        const indicators = await this.prisma.behavioralIndicator.findMany({
            where: { assessmentId },
            orderBy: { detectedAt: 'asc' },
        });

        const allowedTypes: ReadonlySet<BehavioralIndicatorData['type']> = new Set([
            'hesitation',
            'doubt',
            'change',
            'excitement',
            'consistent',
        ]);

        return indicators.map((i) => ({
            type: allowedTypes.has(i.indicatorType as BehavioralIndicatorData['type'])
                ? (i.indicatorType as BehavioralIndicatorData['type'])
                : 'change',
            ...(i.timeTakenMs !== null && i.timeTakenMs !== undefined
                ? { timeTakenMs: i.timeTakenMs }
                : {}),
            ...(i.changeCount !== null && i.changeCount !== undefined
                ? { changeCount: i.changeCount }
                : {}),
            ...(i.metadata && typeof i.metadata === 'object' && !Array.isArray(i.metadata)
                ? { metadata: i.metadata }
                : {}),
        }));
    }

    async calculateBehavioralMetrics(assessmentId: string): Promise<BehavioralMetrics> {
        const [phase1Responses, phase2Responses, indicators] = await Promise.all([
            this.prisma.phase1Response.findMany({
                where: { assessmentId },
                select: { timeTakenMs: true, changeCount: true },
            }),
            this.prisma.phase2Response.findMany({
                where: { assessmentId },
                select: { timeTakenMs: true, changeCount: true },
            }),
            this.prisma.behavioralIndicator.findMany({
                where: { assessmentId },
                select: { indicatorType: true },
            }),
        ]);

        const allResponses = [...phase1Responses, ...phase2Responses];
        const responseTimes = allResponses
            .map((r) => r.timeTakenMs)
            .filter((t): t is number => t !== null && t !== undefined);

        const totalChanges = allResponses.reduce((sum, r) => sum + (r.changeCount ?? 0), 0);

        const averageResponseTime = BehavioralUtil.calculateAverageResponseTime(responseTimes);
        const responseTimeStdDev = BehavioralUtil.calculateResponseTimeStdDev(
            responseTimes,
            averageResponseTime,
        );

        const indicatorCounts = {
            hesitationCount: 0,
            doubtCount: 0,
            excitementCount: 0,
            consistentCount: 0,
        };

        for (const indicator of indicators) {
            switch (indicator.indicatorType) {
                case 'hesitation':
                    indicatorCounts.hesitationCount++;
                    break;
                case 'doubt':
                    indicatorCounts.doubtCount++;
                    break;
                case 'excitement':
                    indicatorCounts.excitementCount++;
                    break;
                case 'consistent':
                    indicatorCounts.consistentCount++;
                    break;
            }
        }

        return {
            averageResponseTime,
            responseTimeStdDev,
            totalChanges,
            ...indicatorCounts,
        };
    }

    async generateBehavioralInsights(assessmentId: string): Promise<BehavioralInsights> {
        const [indicators, metrics] = await Promise.all([
            this.getAssessmentBehaviors(assessmentId),
            this.calculateBehavioralMetrics(assessmentId),
        ]);

        const insights = BehavioralUtil.generateBehavioralInsights(indicators);

        return {
            ...insights,
            metrics,
        };
    }

    async detectHesitation(timeTakenMs: number, assessmentId: string): Promise<boolean> {
        const avgTime = await this.calculateAverageResponseTime(assessmentId);
        return BehavioralUtil.detectHesitation(timeTakenMs, avgTime);
    }

    detectDoubt(changeCount: number): boolean {
        return BehavioralUtil.detectDoubt(changeCount);
    }

    private async calculateAverageResponseTime(assessmentId: string): Promise<number> {
        const [phase1Responses, phase2Responses] = await Promise.all([
            this.prisma.phase1Response.findMany({
                where: { assessmentId },
                select: { timeTakenMs: true },
            }),
            this.prisma.phase2Response.findMany({
                where: { assessmentId },
                select: { timeTakenMs: true },
            }),
        ]);

        const allResponses = [...phase1Responses, ...phase2Responses];
        const responseTimes = allResponses
            .map((r) => r.timeTakenMs)
            .filter((t): t is number => t !== null && t !== undefined);

        return BehavioralUtil.calculateAverageResponseTime(responseTimes);
    }
}
