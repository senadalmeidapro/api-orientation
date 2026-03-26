import { Module } from '@nestjs/common';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { ResultsModule } from '../results/results.module';
import { AdaptiveModule } from '../adaptive/adaptive.module';

@Module({
    imports: [ResultsModule, AdaptiveModule],
    controllers: [RecommendationsController],
    providers: [RecommendationsService],
    exports: [RecommendationsService],
})
export class RecommendationsModule {
}
