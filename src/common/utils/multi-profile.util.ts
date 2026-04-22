import type { RiasecType } from '@prisma/client';

export interface QuestionProfileWeight {
    riasecType: RiasecType;
    weight: number;
}

export interface MultiProfileQuestion {
    id: number;
    profiles: QuestionProfileWeight[];
}

export interface RiasecScores {
    R: number;
    I: number;
    A: number;
    S: number;
    E: number;
    C: number;
}

export interface ProfileSnapshot {
    raw: RiasecScores;
    normalized: RiasecScores;
    dominant: string;
    topThree: Array<{ type: RiasecType; score: number; percentage: number }>;
}

export class MultiProfileUtil {
    static emptyScores(): RiasecScores {
        return { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    }

    static normalizeScores(scores: RiasecScores): RiasecScores {
        const values = Object.values(scores) as number[];
        const total = values.reduce((sum, val) => sum + val, 0);

        if (total === 0) {
            return this.emptyScores();
        }

        const normalized: RiasecScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

        for (const key of Object.keys(scores) as RiasecType[]) {
            normalized[key] = scores[key] / total;
        }

        return normalized;
    }

    static addScores(scores1: RiasecScores, scores2: RiasecScores): RiasecScores {
        const result: RiasecScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
        for (const key of Object.keys(result) as RiasecType[]) {
            result[key] = scores1[key] + scores2[key];
        }
        return result;
    }

    static applyWeightedResponse(
        currentScores: RiasecScores,
        profiles: QuestionProfileWeight[],
        responseValue: number,
    ): RiasecScores {
        const newScores = { ...currentScores };

        for (const profile of profiles) {
            const contribution = responseValue * profile.weight;
            newScores[profile.riasecType] += contribution;
        }

        return newScores;
    }

    static calculateProfileDistance(profile1: RiasecScores, profile2: RiasecScores): number {
        let distance = 0;
        for (const key of Object.keys(profile1) as RiasecType[]) {
            const diff = profile1[key] - profile2[key];
            distance += diff * diff;
        }
        return Math.sqrt(distance);
    }

    static getDominantProfiles(
        scores: RiasecScores,
        count: number = 3,
    ): Array<{ type: RiasecType; score: number }> {
        const entries = Object.entries(scores) as Array<[RiasecType, number]>;
        return entries
            .sort((a, b) => b[1] - a[1])
            .slice(0, count)
            .map(([type, score]) => ({ type, score }));
    }

    static formatProfileCode(scores: RiasecScores): string {
        const dominant = this.getDominantProfiles(scores, 3);
        return dominant.map((p) => p.type).join('');
    }

    static calculateCoverage(profiles: QuestionProfileWeight[]): Map<RiasecType, number> {
        const coverage = new Map<RiasecType, number>();

        for (const profile of profiles) {
            const current = coverage.get(profile.riasecType) || 0;
            coverage.set(profile.riasecType, current + profile.weight);
        }

        return coverage;
    }

    static getUnderrepresentedProfiles(
        currentScores: RiasecScores,
        targetCoverage: number = 0.15,
    ): RiasecType[] {
        const normalized = this.normalizeScores(currentScores);
        const underrepresented: RiasecType[] = [];

        for (const [type, score] of Object.entries(normalized) as Array<[RiasecType, number]>) {
            if (score < targetCoverage) {
                underrepresented.push(type);
            }
        }

        return underrepresented;
    }

    static scoreQuestionRelevance(
        questionProfiles: QuestionProfileWeight[],
        currentProfile: RiasecScores,
        targetBalance: boolean = true,
    ): number {
        const normalized = this.normalizeScores(currentProfile);
        let relevanceScore = 0;

        for (const qp of questionProfiles) {
            if (targetBalance) {
                const currentCoverage = normalized[qp.riasecType];
                const balanceBonus = 1 - currentCoverage;
                relevanceScore += qp.weight * balanceBonus;
            } else {
                const dominance = normalized[qp.riasecType];
                relevanceScore += qp.weight * dominance;
            }
        }

        return relevanceScore;
    }

    static createProfileSnapshot(scores: RiasecScores): ProfileSnapshot {
        const normalized = this.normalizeScores(scores);
        const dominant = this.getDominantProfiles(scores, 3);

        return {
            raw: scores,
            normalized,
            dominant: this.formatProfileCode(scores),
            topThree: dominant.map((d) => ({
                ...d,
                percentage: normalized[d.type] * 100,
            })),
        };
    }
}
