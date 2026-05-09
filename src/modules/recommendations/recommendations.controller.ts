import { Controller, Get, Headers, Query, UnauthorizedException } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { GetRecommendationsDto } from './dto/get-recommendations.dto';
import { publicDecorator } from '@common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
// import { ApiStandardErrorResponses, ApiStandardOkResponse } from '@common/swagger';

@ApiTags('Careers')
// @ApiStandardErrorResponses({ includeNotFound: true })
@Controller('api/v1/careers')
export class RecommendationsController {
    constructor(private readonly service: RecommendationsService) {}

    @ApiOperation({
        summary: 'Recuperer - Get Recommendations',
        description: 'Endpoint pour get recommendations.',
    })
    @ApiHeader({
        name: 'x-session-token',
        required: true,
        description: 'Token de session (éviter le query string).',
        example: '4ce2f33a-8dfe-4b20-a5f2-9d3d8b6d2dcd',
    })
    // @ApiStandardOkResponse({
    //     description: 'Recommandations de carrières récupérées.',
    //     dataExample: [
    //         {
    //             result_id: 'clx-result-id',
    //             career_id: 12,
    //             rank_position: 1,
    //             match_score: 91,
    //             career: {
    //                 id: 12,
    //                 name: 'Ingénieur logiciel',
    //                 category: 'TECH',
    //             },
    //         },
    //     ],
    // })
    @Throttle({ default: { limit: 60, ttl: 60 } })
    @publicDecorator()
    @Get('recommendations')
    getRecommendations(
        @Headers('x-session-token') sessionToken: string | undefined,
        @Query() dto: GetRecommendationsDto,
    ) {
        if (!sessionToken?.trim()) {
            throw new UnauthorizedException('Session invalide ou expirée');
        }
        return this.service.getRecommendations({
            ...dto,
            sessionToken: sessionToken.trim(),
        });
    }

    @ApiOperation({
        summary: 'Recuperer - Get Formation Recommendations',
        description: 'Endpoint pour recommendations de formations avec universites.',
    })
    @ApiHeader({
        name: 'x-session-token',
        required: true,
        description: 'Token de session (éviter le query string).',
        example: '4ce2f33a-8dfe-4b20-a5f2-9d3d8b6d2dcd',
    })
    @Throttle({ default: { limit: 60, ttl: 60 } })
    @publicDecorator()
    @Get('recommendations/formations')
    getFormationRecommendations(
        @Headers('x-session-token') sessionToken: string | undefined,
        @Query() dto: GetRecommendationsDto,
    ) {
        if (!sessionToken?.trim()) {
            throw new UnauthorizedException('Session invalide ou expirée');
        }
        return this.service.getFormationRecommendations({
            ...dto,
            sessionToken: sessionToken.trim(),
        });
    }
}
