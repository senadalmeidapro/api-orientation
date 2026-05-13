export interface BehavioralIndicatorData {
  type: 'hesitation' | 'doubt' | 'change' | 'excitement' | 'consistent';
  timeTakenMs?: number;
  changeCount?: number;
  metadata?: Record<string, any>;
}

export interface ResponseMetadata {
  timestamps?: number[];
  changes?: Array<{ from: number; to: number; at: number }>;
  focusEvents?: Array<{ type: 'blur' | 'focus'; at: number }>;
  [key: string]: any;
}

export class BehavioralUtil {
  private static readonly HESITATION_THRESHOLD_MS = 15000;
  private static readonly QUICK_RESPONSE_THRESHOLD_MS = 2000;
  private static readonly DOUBT_CHANGE_THRESHOLD = 2;

  static detectHesitation(timeTakenMs: number, avgTimeMs?: number): boolean {
    if (avgTimeMs) {
      return timeTakenMs > avgTimeMs * 2;
    }
    return timeTakenMs > this.HESITATION_THRESHOLD_MS;
  }

  static detectDoubt(changeCount: number): boolean {
    return changeCount >= this.DOUBT_CHANGE_THRESHOLD;
  }

  static detectExcitement(timeTakenMs: number, changeCount: number): boolean {
    return timeTakenMs < this.QUICK_RESPONSE_THRESHOLD_MS && changeCount === 0;
  }

  static detectConsistency(changeCount: number, timeTakenMs: number, avgTimeMs?: number): boolean {
    const hasNoChanges = changeCount === 0;
    const isReasonableTime = avgTimeMs
      ? Math.abs(timeTakenMs - avgTimeMs) < avgTimeMs * 0.5
      : timeTakenMs > this.QUICK_RESPONSE_THRESHOLD_MS &&
        timeTakenMs < this.HESITATION_THRESHOLD_MS;

    return hasNoChanges && isReasonableTime;
  }

  static analyzeResponse(
    timeTakenMs: number,
    changeCount: number,
    avgTimeMs?: number,
  ): BehavioralIndicatorData[] {
    const indicators: BehavioralIndicatorData[] = [];

    if (this.detectHesitation(timeTakenMs, avgTimeMs)) {
      indicators.push({
        type: 'hesitation',
        timeTakenMs,
        changeCount,
        metadata: { threshold: avgTimeMs || this.HESITATION_THRESHOLD_MS },
      });
    }

    if (this.detectDoubt(changeCount)) {
      indicators.push({
        type: 'doubt',
        timeTakenMs,
        changeCount,
        metadata: { threshold: this.DOUBT_CHANGE_THRESHOLD },
      });
    }

    if (this.detectExcitement(timeTakenMs, changeCount)) {
      indicators.push({
        type: 'excitement',
        timeTakenMs,
        changeCount,
        metadata: { threshold: this.QUICK_RESPONSE_THRESHOLD_MS },
      });
    }

    if (this.detectConsistency(changeCount, timeTakenMs, avgTimeMs)) {
      indicators.push({
        type: 'consistent',
        timeTakenMs,
        changeCount,
        metadata: { avgTime: avgTimeMs },
      });
    }

    return indicators;
  }

  static calculateAverageResponseTime(responseTimes: number[]): number {
    if (responseTimes.length === 0) return 0;
    const sum = responseTimes.reduce((acc, time) => acc + time, 0);
    return sum / responseTimes.length;
  }

  static calculateResponseTimeStdDev(responseTimes: number[], avgTime?: number): number {
    if (responseTimes.length === 0) return 0;

    const avg = avgTime ?? this.calculateAverageResponseTime(responseTimes);
    const squaredDiffs = responseTimes.map((time) => Math.pow(time - avg, 2));
    const avgSquaredDiff = squaredDiffs.reduce((acc, val) => acc + val, 0) / responseTimes.length;

    return Math.sqrt(avgSquaredDiff);
  }

  static categorizeResponsePattern(indicators: BehavioralIndicatorData[]): {
    pattern: 'confident' | 'uncertain' | 'impulsive' | 'deliberate' | 'mixed';
    description: string;
  } {
    const types = new Set(indicators.map((i) => i.type));

    if (types.has('excitement') && !types.has('hesitation')) {
      return {
        pattern: 'confident',
        description: 'Réponses rapides et décisives sans hésitation',
      };
    }

    if (types.has('doubt') && types.has('hesitation')) {
      return {
        pattern: 'uncertain',
        description: 'Nombreuses hésitations et changements de réponses',
      };
    }

    if (types.has('excitement') && types.has('change')) {
      return {
        pattern: 'impulsive',
        description: 'Réponses rapides mais avec corrections',
      };
    }

    if (types.has('consistent')) {
      return {
        pattern: 'deliberate',
        description: 'Réponses réfléchies et cohérentes',
      };
    }

    return {
      pattern: 'mixed',
      description: 'Comportement variable selon les questions',
    };
  }

  static generateBehavioralInsights(allIndicators: BehavioralIndicatorData[]): {
    dominantPattern: string;
    confidence: number;
    observations: string[];
    recommendations: string[];
  } {
    if (allIndicators.length === 0) {
      return {
        dominantPattern: 'insufficient_data',
        confidence: 0,
        observations: [],
        recommendations: [],
      };
    }

    const typeCount = new Map<string, number>();
    for (const indicator of allIndicators) {
      const current = typeCount.get(indicator.type) || 0;
      typeCount.set(indicator.type, current + 1);
    }

    const pattern = this.categorizeResponsePattern(allIndicators);
    const totalCount = allIndicators.length;
    const dominantCount = Math.max(...Array.from(typeCount.values()));
    const confidence = dominantCount / totalCount;

    const observations: string[] = [];
    const recommendations: string[] = [];

    if (typeCount.has('hesitation')) {
      const count = typeCount.get('hesitation')!;
      observations.push(
        `${count} réponses avec hésitation détectée (${((count / totalCount) * 100).toFixed(1)}%)`,
      );
      recommendations.push(
        'Prendre le temps de réfléchir est normal, mais une hésitation excessive peut indiquer un besoin de clarification.',
      );
    }

    if (typeCount.has('doubt')) {
      const count = typeCount.get('doubt')!;
      observations.push(
        `${count} réponses modifiées plusieurs fois (${((count / totalCount) * 100).toFixed(1)}%)`,
      );
      recommendations.push(
        'Les changements multiples peuvent indiquer une incertitude. Faire confiance à son instinct initial est souvent bénéfique.',
      );
    }

    if (typeCount.has('excitement')) {
      const count = typeCount.get('excitement')!;
      observations.push(
        `${count} réponses spontanées et rapides (${((count / totalCount) * 100).toFixed(1)}%)`,
      );
      recommendations.push(
        "L'enthousiasme est positif ! Ces réponses rapides indiquent souvent une forte conviction.",
      );
    }

    if (typeCount.has('consistent')) {
      const count = typeCount.get('consistent')!;
      observations.push(
        `${count} réponses cohérentes et réfléchies (${((count / totalCount) * 100).toFixed(1)}%)`,
      );
      recommendations.push(
        'Une approche réfléchie démontre une bonne introspection et maturité dans le choix.',
      );
    }

    return {
      dominantPattern: pattern.pattern,
      confidence,
      observations,
      recommendations,
    };
  }

  static formatResponseMetadata(
    startTime: number,
    changes: Array<{ from: number; to: number; timestamp: number }>,
  ): ResponseMetadata {
    return {
      timestamps: [startTime, ...changes.map((c) => c.timestamp)],
      changes: changes.map((c) => ({
        from: c.from,
        to: c.to,
        at: c.timestamp,
      })),
    };
  }

  static extractMetrics(metadata?: ResponseMetadata): {
    timeTakenMs: number;
    changeCount: number;
  } {
    const timestamps = metadata?.timestamps ?? [];
    const changes = metadata?.changes ?? [];

    if (timestamps.length < 2) {
      return { timeTakenMs: 0, changeCount: 0 };
    }

    const timeTakenMs = timestamps[timestamps.length - 1]! - timestamps[0]!;
    const changeCount = changes.length;

    return { timeTakenMs, changeCount };
  }
}
