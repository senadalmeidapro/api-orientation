import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
// import { ApiStandardErrorResponses, ApiStandardOkResponse } from '@common/swagger';

@ApiTags('Scoring')
@ApiBearerAuth('access-token')
// @ApiStandardErrorResponses({ includeUnauthorized: true })
@Controller('api/v1/scoring')
export class ScoringController {
  @ApiOperation({
    summary: 'Vérifier la santé du module scoring',
    description: 'Retourne un statut simple indiquant que le module de scoring est opérationnel.',
  })
  // @ApiStandardOkResponse({
  //     description: 'Statut du module scoring récupéré.',
  //     message: 'Santé du module scoring récupérée.',
  //     dataExample: { status: 'ok', module: 'scoring' },
  // })
  @Get('health')
  health() {
    return { status: 'ok', module: 'scoring' };
  }
}
