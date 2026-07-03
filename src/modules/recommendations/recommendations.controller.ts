import { Body, Controller, Get, Headers, Post, Query, UnauthorizedException } from '@nestjs/common';
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

  private extractSessionToken(sessionToken: string | undefined): string {
    if (!sessionToken?.trim()) {
      throw new UnauthorizedException('Session invalide ou expirée');
    }
    return sessionToken.trim();
  }

  @ApiOperation({
    summary: 'Recuperer - Career Recommendations',
    description: 'Endpoint pour recuperer les recommandations de metiers.',
  })
  @ApiHeader({
    name: 'X-Session-Token',
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
  @Get('career-recommendations')
  @Get('recommendations')
  getCareerRecommendations(
    @Headers('X-Session-Token') sessionToken: string | undefined,
    @Query() dto: GetRecommendationsDto,
  ) {
    const token = this.extractSessionToken(sessionToken);
    return this.service.getCareerRecommendations(dto, token);
  }

  @ApiOperation({
    summary: 'Recuperer - Formation Recommendations',
    description: 'Endpoint pour recuperer les recommandations de formations avec universites.',
  })
  @ApiHeader({
    name: 'X-Session-Token',
    required: true,
    description: 'Token de session (éviter le query string).',
    example: '4ce2f33a-8dfe-4b20-a5f2-9d3d8b6d2dcd',
  })
  @Throttle({ default: { limit: 60, ttl: 60 } })
  @publicDecorator()
  @Get('formation-recommendations')
  @Get('recommendations/formations')
  getFormationRecommendations(
    @Headers('X-Session-Token') sessionToken: string | undefined,
    @Query() dto: GetRecommendationsDto,
  ) {
    const token = this.extractSessionToken(sessionToken);
    return this.service.getFormationRecommendations(dto, token);
  }

  @ApiOperation({
    summary: 'Recuperer - University Recommendations',
    description:
      "Endpoint pour recuperer les recommandations d'universites sauvegardees (agregees a partir des formations).",
  })
  @ApiHeader({
    name: 'X-Session-Token',
    required: true,
    description: 'Token de session (éviter le query string).',
    example: '4ce2f33a-8dfe-4b20-a5f2-9d3d8b6d2dcd',
  })
  @Throttle({ default: { limit: 60, ttl: 60 } })
  @publicDecorator()
  @Get('university-recommendations')
  @Get('recommendations/universities')
  getUniversityRecommendations(
    @Headers('X-Session-Token') sessionToken: string | undefined,
    @Query('assessmentId') assessmentId?: string,
  ) {
    const token = this.extractSessionToken(sessionToken);
    return this.service.getSavedUniversityRecommendations(token, assessmentId);
  }

  @ApiOperation({
    summary: 'Finaliser - Recommendations (carrieres, formations, universites)',
    description:
      "Calcule et persiste en une seule fois les recommandations de carrieres, formations et universites pour un resultat de test. A appeler une fois a l'issue du test.",
  })
  @ApiHeader({
    name: 'X-Session-Token',
    required: true,
    description: 'Token de session (éviter le query string).',
    example: '4ce2f33a-8dfe-4b20-a5f2-9d3d8b6d2dcd',
  })
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @publicDecorator()
  @Post('recommendations/finalize')
  finalizeRecommendations(
    @Headers('X-Session-Token') sessionToken: string | undefined,
    @Body() dto: GetRecommendationsDto,
  ) {
    const token = this.extractSessionToken(sessionToken);
    return this.service.finalizeTestRecommendations(token, dto.assessmentId);
  }
}
