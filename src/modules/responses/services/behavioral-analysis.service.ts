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
    const response = await this.prisma.response.findFirst({
      where: { id: responseId, assessmentId },
      select: { behavioralFlags: true, metadata: true },
    });
    if (!response) return;

    const behavioralFlags = Array.from(new Set([...response.behavioralFlags, indicator.type]));
    await this.prisma.response.update({
      where: { id: responseId },
      data: {
        behavioralFlags,
        timeTakenMs: indicator.timeTakenMs ?? null,
        changeCount: indicator.changeCount ?? 0,
        metadata: {
          ...(response.metadata &&
          typeof response.metadata === 'object' &&
          !Array.isArray(response.metadata)
            ? response.metadata
            : {}),
          behavioral: indicator.metadata ?? {},
        },
      },
    });
  }

  async getAssessmentBehaviors(assessmentId: string): Promise<BehavioralIndicatorData[]> {
    const responses = await this.prisma.response.findMany({
      where: { assessmentId },
      orderBy: { createdAt: 'asc' },
      select: {
        behavioralFlags: true,
        timeTakenMs: true,
        changeCount: true,
        metadata: true,
      },
    });

    const allowedTypes: ReadonlySet<BehavioralIndicatorData['type']> = new Set([
      'hesitation',
      'doubt',
      'change',
      'excitement',
      'consistent',
    ]);

    return responses.flatMap((response) =>
      response.behavioralFlags.map((flag) => ({
        type: allowedTypes.has(flag as BehavioralIndicatorData['type'])
          ? (flag as BehavioralIndicatorData['type'])
          : 'change',
        ...(response.timeTakenMs !== null && response.timeTakenMs !== undefined
          ? { timeTakenMs: response.timeTakenMs }
          : {}),
        ...(response.changeCount !== null && response.changeCount !== undefined
          ? { changeCount: response.changeCount }
          : {}),
        ...(response.metadata &&
        typeof response.metadata === 'object' &&
        !Array.isArray(response.metadata)
          ? { metadata: response.metadata }
          : {}),
      })),
    );
  }

  async calculateBehavioralMetrics(assessmentId: string): Promise<BehavioralMetrics> {
    const allResponses = await this.prisma.response.findMany({
      where: { assessmentId },
      select: { timeTakenMs: true, changeCount: true, behavioralFlags: true },
    });
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

    for (const response of allResponses) {
      for (const flag of response.behavioralFlags) {
        switch (flag) {
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
    const allResponses = await this.prisma.response.findMany({
      where: { assessmentId },
      select: { timeTakenMs: true },
    });
    const responseTimes = allResponses
      .map((r) => r.timeTakenMs)
      .filter((t): t is number => t !== null && t !== undefined);

    return BehavioralUtil.calculateAverageResponseTime(responseTimes);
  }
}
