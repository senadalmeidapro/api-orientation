import { Module } from '@nestjs/common';
import { ScoringService } from './scoring.service';
import { ScoringController } from './scoring.controller';
import { AdaptiveSelectionService } from '../questions/services/adaptive-selection.service';

@Module({
    controllers: [ScoringController],
    providers: [ScoringService, AdaptiveSelectionService],
    exports: [ScoringService],
})
export class ScoringModule {}
