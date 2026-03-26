import { Injectable } from '@nestjs/common';
import { RecommendationEngine } from './recommendation-engine.service';
import { HIGH_RESPONSE_TIME_MS, RESPONSE_VARIANCE_THRESHOLD } from './adaptive.constants';

@Injectable()
export class ExplanationService {
    constructor(private readonly recommendationEngine: RecommendationEngine) {
    }

    async explainRecommendation(userId: string, careerId: number) {
        const context = await this.recommendationEngine.getScoreContext(userId, careerId);

        const factors: string[] = [];
        if (context.riasecScore >= 0.6) factors.push('match RIASEC élevé');
        else if (context.riasecScore >= 0.4) factors.push('match RIASEC modéré');

        if (context.matchedLiked) factors.push('intérêt démontré pour métiers similaires');
        if (context.matchedDisliked) factors.push('réserves sur des métiers similaires');

        if (context.explorationScore >= 0.4) factors.push('exploration active des métiers');
        if (context.avgResponseTime >= HIGH_RESPONSE_TIME_MS)
            factors.push('temps élevé sur fiches techniques');
        if (context.responseVariance > RESPONSE_VARIANCE_THRESHOLD)
            factors.push('variabilité des temps de réponse');

        const reason =
            factors.length > 0
                ? `Recommandation basée sur ${factors[0].toLowerCase()}.`
                : 'Recommandation basée sur votre profil RIASEC et vos interactions récentes.';

        return {
            reason,
            factors,
            confidence: context.confidence,
        };
    }
}
