import { Controller, Get, Query } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { GetRecommendationsDto } from './dto/get-recommendations.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiStandardErrorResponses, ApiStandardOkResponse } from '../../common/swagger';

@ApiTags('Careers')
@ApiStandardErrorResponses({ includeNotFound: true })
@Controller('careers')
export class RecommendationsController {
    constructor(private readonly service: RecommendationsService) {}

    @ApiOperation({
        summary: 'Recuperer - Get Recommendations',
        description: 'Endpoint pour get recommendations.',
    })
    @ApiQuery({
        name: 'sessionToken',
        required: true,
        description: 'Token de session.',
        example: '4ce2f33a-8dfe-4b20-a5f2-9d3d8b6d2dcd',
    })
    @ApiStandardOkResponse({
        description: 'Recommandations de carrières récupérées.',
        dataExample: [
            {
                result_id: 'clx-result-id',
                career_id: 12,
                rank_position: 1,
                match_score: 91,
                career: {
                    id: 12,
                    name: 'Ingénieur logiciel',
                    category: 'TECH',
                },
            },
        ],
    })
    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Public()
    @Get('recommendations')
    getRecommendations(@Query() dto: GetRecommendationsDto) {
        return this.service.getRecommendations(dto);
    }
}
