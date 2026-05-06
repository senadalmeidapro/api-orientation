import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiClient } from './ai.client';
import { GoogleAiClient } from './google-ai.client';
import { AiProviderFactory } from './ai-provider.factory';
import { ResultsModule } from '../results/results.module';
import { RecommendationsModule } from '../recommendations/recommendations.module';

@Module({
    imports: [ResultsModule, RecommendationsModule],
    controllers: [AiController],
    providers: [AiClient, GoogleAiClient, AiProviderFactory, AiService],
    exports: [AiService, AiProviderFactory],
})
export class AiModule {}
