import type { RiasecType } from '@prisma/client';
import {
    MultiProfileUtil,
    type MultiProfileQuestion,
    type QuestionProfileWeight,
    type RiasecScores,
} from './multi-profile.util';

export interface AdaptiveSelectionConfig {
    targetBalance: boolean;
    diversityWeight: number;
    profileWeight: number;
    excludeAsked: boolean;
}

export interface QuestionScore {
    questionId: number;
    score: number;
    profiles: QuestionProfileWeight[];
}

export class AdaptiveUtil {
    private static readonly DEFAULT_CONFIG: AdaptiveSelectionConfig = {
        targetBalance: true,
        diversityWeight: 0.6,
        profileWeight: 0.4,
        excludeAsked: true,
    };

    static calculateQuestionScore(
        question: MultiProfileQuestion,
        currentProfile: RiasecScores,
        config: Partial<AdaptiveSelectionConfig> = {},
    ): number {
        const cfg = { ...this.DEFAULT_CONFIG, ...config };

        const relevanceScore = MultiProfileUtil.scoreQuestionRelevance(
            question.profiles,
            currentProfile,
            cfg.targetBalance,
        );

        const diversityScore = this.calculateDiversityScore(question.profiles, currentProfile);

        const finalScore =
            cfg.profileWeight * relevanceScore + cfg.diversityWeight * diversityScore;

        return finalScore;
    }

    static calculateDiversityScore(
        questionProfiles: QuestionProfileWeight[],
        currentProfile: RiasecScores,
    ): number {
        const normalized = MultiProfileUtil.normalizeScores(currentProfile);
        const underrepresented = MultiProfileUtil.getUnderrepresentedProfiles(normalized);

        let diversityScore = 0;
        for (const profile of questionProfiles) {
            if (underrepresented.includes(profile.riasecType)) {
                diversityScore += profile.weight * 2;
            } else {
                diversityScore += profile.weight * 0.5;
            }
        }

        return diversityScore;
    }

    static selectTopQuestions(
        availableQuestions: MultiProfileQuestion[],
        currentProfile: RiasecScores,
        batchSize: number,
        config: Partial<AdaptiveSelectionConfig> = {},
    ): number[] {
        const scoredQuestions: QuestionScore[] = availableQuestions.map((q) => ({
            questionId: q.id,
            score: this.calculateQuestionScore(q, currentProfile, config),
            profiles: q.profiles,
        }));

        scoredQuestions.sort((a, b) => b.score - a.score);

        const selected: number[] = [];
        const selectedProfiles = new Set<RiasecType>();

        for (const question of scoredQuestions) {
            if (selected.length >= batchSize) break;

            const hasNewProfile = question.profiles.some(
                (p) => !selectedProfiles.has(p.riasecType),
            );

            if (hasNewProfile || selected.length < batchSize / 2) {
                selected.push(question.questionId);
                question.profiles.forEach((p) => selectedProfiles.add(p.riasecType));
            }
        }

        while (selected.length < batchSize && selected.length < scoredQuestions.length) {
            const remaining = scoredQuestions.filter((q) => !selected.includes(q.questionId));
            if (remaining.length === 0) break;
            selected.push(remaining[0]!.questionId);
        }

        return selected;
    }

    static shouldAdjustBatchSize(
        currentBatch: number,
        totalDepth: number,
        remainingQuestions: number,
    ): { newSize: number; reason: string } | null {
        const estimatedRemaining = totalDepth * 6 - currentBatch * 5;

        if (remainingQuestions < 5 && remainingQuestions > 0) {
            return {
                newSize: remainingQuestions,
                reason: 'Insufficient remaining questions',
            };
        }

        if (estimatedRemaining < 10 && remainingQuestions > 10) {
            return {
                newSize: Math.min(10, remainingQuestions),
                reason: 'Approaching completion, increase batch size',
            };
        }

        return null;
    }

    static calculateBatchProgress(
        currentBatch: number,
        depth: number,
        riasecCount: number = 6,
    ): {
        percentage: number;
        estimatedTotal: number;
        completed: number;
    } {
        const estimatedTotal = depth * riasecCount;
        const completed = currentBatch * 5;
        const percentage = Math.min(100, (completed / estimatedTotal) * 100);

        return {
            percentage,
            estimatedTotal,
            completed,
        };
    }

    static determineNextPhaseTransition(
        currentProfile: RiasecScores,
        batchesCompleted: number,
        minBatches: number = 3,
    ): {
        shouldTransition: boolean;
        reason: string;
        confidence: number;
    } {
        if (batchesCompleted < minBatches) {
            return {
                shouldTransition: false,
                reason: 'Minimum batches not reached',
                confidence: 0,
            };
        }

        const dominant = MultiProfileUtil.getDominantProfiles(currentProfile, 3);
        const normalized = MultiProfileUtil.normalizeScores(currentProfile);

        const topThreeSum = dominant.reduce((sum, d) => sum + normalized[d.type], 0);

        const confidence = topThreeSum;

        if (confidence > 0.75) {
            return {
                shouldTransition: true,
                reason: 'Strong profile convergence detected',
                confidence,
            };
        }

        if (batchesCompleted >= minBatches * 2) {
            return {
                shouldTransition: true,
                reason: 'Maximum batches reached',
                confidence,
            };
        }

        return {
            shouldTransition: false,
            reason: 'Profile not sufficiently converged',
            confidence,
        };
    }

    static generateAdaptiveState(
        currentProfile: RiasecScores,
        askedQuestions: number[],
        batchIndex: number,
    ): {
        probabilities: RiasecScores;
        askedQuestions: number[];
        batchIndex: number;
        lastUpdated: string;
    } {
        const normalized = MultiProfileUtil.normalizeScores(currentProfile);

        return {
            probabilities: normalized,
            askedQuestions,
            batchIndex,
            lastUpdated: new Date().toISOString(),
        };
    }

    static estimateRemainingTime(
        currentBatch: number,
        avgBatchTimeMs: number,
        targetBatches: number,
    ): {
        estimatedRemainingMs: number;
        estimatedCompletionTime: Date;
    } {
        const remainingBatches = Math.max(0, targetBatches - currentBatch);
        const estimatedRemainingMs = remainingBatches * avgBatchTimeMs;
        const estimatedCompletionTime = new Date(Date.now() + estimatedRemainingMs);

        return {
            estimatedRemainingMs,
            estimatedCompletionTime,
        };
    }

    static analyzeProfileStability(profileHistory: RiasecScores[]): {
        stable: boolean;
        variance: number;
        trend: 'converging' | 'diverging' | 'stable';
    } {
        if (profileHistory.length < 2) {
            return { stable: false, variance: 0, trend: 'stable' };
        }

        const distances: number[] = [];
        for (let i = 1; i < profileHistory.length; i++) {
            const distance = MultiProfileUtil.calculateProfileDistance(
                profileHistory[i - 1]!,
                profileHistory[i]!,
            );
            distances.push(distance);
        }

        const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
        const variance = this.calculateVariance(distances);

        const recentDistances = distances.slice(-3);
        const isConverging = recentDistances.every((d, i, arr) => i === 0 || d <= arr[i - 1]!);
        const isDiverging = recentDistances.every((d, i, arr) => i === 0 || d >= arr[i - 1]!);

        return {
            stable: variance < 0.05 && avgDistance < 0.2,
            variance,
            trend: isConverging ? 'converging' : isDiverging ? 'diverging' : 'stable',
        };
    }

    private static calculateVariance(values: number[]): number {
        if (values.length === 0) return 0;
        const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
        const squaredDiffs = values.map((v) => Math.pow(v - avg, 2));
        return squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
    }
}
