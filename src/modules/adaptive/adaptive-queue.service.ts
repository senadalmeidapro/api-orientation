import { Injectable, Logger } from '@nestjs/common';
import { AdaptiveProfileService } from './adaptive-profile.service';
import { FeatureService } from './feature.service';
import { RecommendationEngine } from './recommendation-engine.service';

@Injectable()
export class AdaptiveQueueService {
    private readonly logger = new Logger(AdaptiveQueueService.name);
    private readonly queue: string[] = [];
    private readonly pending = new Set<string>();
    private processing = false;

    constructor(
        private readonly featureService: FeatureService,
        private readonly profileService: AdaptiveProfileService,
        private readonly recommendationEngine: RecommendationEngine,
    ) {
    }

    enqueueRecompute(userId: string) {
        if (this.pending.has(userId)) return;
        this.queue.push(userId);
        this.pending.add(userId);
        if (!this.processing) {
            this.processing = true;
            setImmediate(() => void this.processQueue());
        }
    }

    private async processQueue() {
        while (this.queue.length) {
            const userId = this.queue.shift();
            if (!userId) continue;
            this.pending.delete(userId);
            try {
                await this.featureService.updateUserFeatures(userId);
                await this.profileService.computeAdaptiveProfile(userId, { forceRefresh: true });
                await this.recommendationEngine.precomputeRecommendations(userId);
            } catch (err) {
                this.logger.error(
                    `Adaptive recompute failed for user ${userId}`,
                    err instanceof Error ? err.stack : String(err),
                );
            }
        }
        this.processing = false;
    }
}
