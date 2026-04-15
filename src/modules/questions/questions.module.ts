import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { AdaptiveSelectionService } from './services/adaptive-selection.service';
import { BatchManagementService } from '../sessions/services/batch-management.service';

@Module({
    controllers: [QuestionsController],
    providers: [QuestionsService, AdaptiveSelectionService, BatchManagementService],
    exports: [QuestionsService, AdaptiveSelectionService],
})
export class QuestionsModule {}
