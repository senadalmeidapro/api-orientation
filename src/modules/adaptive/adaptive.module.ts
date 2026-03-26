import { Module } from '@nestjs/common';
import { AdaptiveCacheService } from './adaptive-cache.service';
import { AdaptiveProfileService } from './adaptive-profile.service';
import { AdaptiveQueueService } from './adaptive-queue.service';
import { ExplanationService } from './explanation.service';
import { FeatureService } from './feature.service';
import { InteractionEventsService } from './interaction-events.service';
import { RecommendationEngine } from './recommendation-engine.service';

@Module({
    providers: [
        AdaptiveCacheService,
        FeatureService,
        AdaptiveProfileService,
        RecommendationEngine,
        ExplanationService,
        AdaptiveQueueService,
        InteractionEventsService,
    ],
    exports: [
        AdaptiveCacheService,
        FeatureService,
        AdaptiveProfileService,
        RecommendationEngine,
        ExplanationService,
        AdaptiveQueueService,
        InteractionEventsService,
    ],
})
export class AdaptiveModule {
}
