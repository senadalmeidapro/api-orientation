import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { GetRecommendationsDto } from './dto/get-recommendations.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { GetAdaptiveRecommendationsDto } from './dto/get-adaptive-recommendations.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('careers')
export class RecommendationsController {
    constructor(private readonly service: RecommendationsService) {
    }

    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Public()
    @Get('recommendations')
    getRecommendations(@Query() dto: GetRecommendationsDto) {
        return this.service.getRecommendations(dto);
    }

    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Get('recommendations/adaptive')
    getAdaptiveRecommendations(
        @Query() dto: GetAdaptiveRecommendationsDto,
        @CurrentUser() user: any,
    ) {
        return this.service.getAdaptiveRecommendations(user?.id, dto);
    }

    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Get('recommendations/:careerId/explain')
    explainRecommendation(
        @Param('careerId', ParseIntPipe) careerId: number,
        @CurrentUser() user: any,
    ) {
        return this.service.explainRecommendation(user?.id, careerId);
    }
}
