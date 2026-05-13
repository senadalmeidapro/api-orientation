import { Module } from '@nestjs/common';
import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';
import { ScoringModule } from '../scoring/scoring.module';
import { TreasureMapController } from './treasure-map.controller';
import { TreasureMapService } from './treasure-map.service';
import { MediaModule } from '../media/media.module';
import { BadgesModule } from '../badges/badges.module';
import { EnhancedResultsService } from './services/enhanced-results.service';
import { BehavioralAnalysisService } from '../responses/services/behavioral-analysis.service';
import { AdaptiveSelectionService } from '../questions/services/adaptive-selection.service';
import { AIAdaptiveService } from '../ai/services/ai-adaptive.service';
import { AiClient } from '../ai/ai.client';

@Module({
  imports: [ScoringModule, MediaModule, BadgesModule],
  controllers: [ResultsController, TreasureMapController],
  providers: [
    ResultsService,
    TreasureMapService,
    EnhancedResultsService,
    BehavioralAnalysisService,
    AdaptiveSelectionService,
    AIAdaptiveService,
    AiClient,
  ],
  exports: [ResultsService, EnhancedResultsService],
})
export class ResultsModule {}
