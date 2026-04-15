import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiClient } from './ai.client';
import { ResultsModule } from '../results/results.module';
import { RecommendationsModule } from '../recommendations/recommendations.module';

@Module({
    imports: [ResultsModule, RecommendationsModule],
    controllers: [AiController],
    providers: [AiService, AiClient],
    exports: [AiService],
})
export class AiModule {}
