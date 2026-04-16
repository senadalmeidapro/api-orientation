import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BehavioralUtil, BehavioralIndicatorData } from '../../../common/utils/behavioral.util';

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
                assessment_id: assessmentId,
                response_id: responseId,
                indicator_type: indicator.type,
                time_taken_ms: indicator.timeTakenMs,
                change_count: indicator.changeCount || 0,
                metadata: indicator.metadata || {},
            },
        });
    }

    async getAssessmentBehaviors(assessmentId: string): Promise<BehavioralIndicatorData[]> {
        const indicators = await this.prisma.behavioralIndicator.findMany({
            where: { assessment_id: assessmentId },
            orderBy: { detected_at: 'asc' },
        });

        return indicators.map((i) => ({
            type: i.indicator_type as any,
            timeTakenMs: i.time_taken_ms || undefined,
            changeCount: i.change_count,
            metadata: (i.metadata as Record<string, any>) || undefined,
        }));
    }

    async calculateBehavioralMetrics(assessmentId: string): Promise<BehavioralMetrics> {
        const [phase1Responses, phase2Responses, indicators] = await Promise.all([
            this.prisma.phase1Response.findMany({
                where: { assessment_id: assessmentId },
                select: { time_taken_ms: true, change_count: true },
            }),
            this.prisma.phase2Response.findMany({
                where: { assessment_id: assessmentId },
                select: { time_taken_ms: true, change_count: true },
            }),
            this.prisma.behavioralIndicator.findMany({
                where: { assessment_id: assessmentId },
                select: { indicator_type: true },
            }),
        ]);

        const allResponses = [...phase1Responses, ...phase2Responses];
        const responseTimes = allResponses
            .map((r) => r.time_taken_ms)
            .filter((t): t is number => t !== null && t !== undefined);

        const totalChanges = allResponses.reduce((sum, r) => sum + (r.change_count || 0), 0);

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
            switch (indicator.indicator_type) {
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

    async detectDoubt(changeCount: number): Promise<boolean> {
        return BehavioralUtil.detectDoubt(changeCount);
    }

    private async calculateAverageResponseTime(assessmentId: string): Promise<number> {
        const [phase1Responses, phase2Responses] = await Promise.all([
            this.prisma.phase1Response.findMany({
                where: { assessment_id: assessmentId },
                select: { time_taken_ms: true },
            }),
            this.prisma.phase2Response.findMany({
                where: { assessment_id: assessmentId },
                select: { time_taken_ms: true },
            }),
        ]);

        const allResponses = [...phase1Responses, ...phase2Responses];
        const responseTimes = allResponses
            .map((r) => r.time_taken_ms)
            .filter((t): t is number => t !== null && t !== undefined);

        return BehavioralUtil.calculateAverageResponseTime(responseTimes);
    }
}
