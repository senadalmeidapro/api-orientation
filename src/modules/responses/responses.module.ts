import { Module } from '@nestjs/common';
import { ResponsesController } from './responses.controller';
import { ResponsesService } from './responses.service';
import { BadgesModule } from '../badges/badges.module';
import { BehavioralAnalysisService } from './services/behavioral-analysis.service';
import { BatchManagementService } from '../sessions/services/batch-management.service';
import { AdaptiveSelectionService } from '../questions/services/adaptive-selection.service';

@Module({
  imports: [BadgesModule],
  controllers: [ResponsesController],
  providers: [
    ResponsesService,
    BehavioralAnalysisService,
    BatchManagementService,
    AdaptiveSelectionService,
  ],
  exports: [ResponsesService, BehavioralAnalysisService],
})
export class ResponsesModule {}
