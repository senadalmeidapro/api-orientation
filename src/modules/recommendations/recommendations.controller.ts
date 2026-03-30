import { Controller, Get, Query } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { GetRecommendationsDto } from './dto/get-recommendations.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('careers')
export class RecommendationsController {
    constructor(private readonly service: RecommendationsService) {}

    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Public()
    @Get('recommendations')
    getRecommendations(@Query() dto: GetRecommendationsDto) {
        return this.service.getRecommendations(dto);
    }
}
