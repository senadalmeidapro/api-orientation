import { Module } from '@nestjs/common';
import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';
import { ScoringModule } from '../scoring/scoring.module';
import { TreasureMapController } from './treasure-map.controller';
import { TreasureMapService } from './treasure-map.service';
import { MediaModule } from '../media/media.module';
import { BadgesModule } from '../badges/badges.module';

@Module({
    imports: [ScoringModule, MediaModule, BadgesModule],
    controllers: [ResultsController, TreasureMapController],
    providers: [ResultsService, TreasureMapService],
    exports: [ResultsService],
})
export class ResultsModule {
}
