import { Controller, Get, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetQuestionsDto, GetNextBatchDto } from './dto';
// import { ApiStandardErrorResponses, ApiStandardOkResponse } from '@common/swagger';

@ApiTags('Questions')
@ApiBearerAuth('access-token')
// @ApiStandardErrorResponses({ includeUnauthorized: true, includeNotFound: true })
@Controller('api/v1/questions')
export class QuestionsController {
  constructor(private readonly service: QuestionsService) {}

  /*@Throttle({ default: { limit: 120, ttl: 60 } })
  @Get('general')
  @ApiOperation({
    summary: 'Récupérer les questions générales',
    description:
      'Retourne les questions générales restantes pour la session/assessment fournis, en tenant compte de la profondeur (`depth`) et des réponses déjà soumises.',
  })
  @ApiQuery({
    name: 'sessionToken',
    required: true,
    description: 'Token de session actif.',
    example: '4ce2f33a-8dfe-4b20-a5f2-9d3d8b6d2dcd',
  })
  getGeneral(@Query() query: GetGeneralQuestionsDto) {
    return this.service.getQuestions({ ...query, currentCategory: TestType.GENERALE });
  }*/

  @Throttle({ default: { limit: 120, ttl: 60 } })
  @Get('category')
  @ApiOperation({
    summary: 'Récupérer les questions par catégorie',
    description:
      'Retourne les questions de la catégorie demandée (ou catégorie courante), filtrées selon les réponses déjà enregistrées.',
  })
  @ApiQuery({
    name: 'sessionToken',
    required: true,
    description: 'Token de session actif.',
    example: '4ce2f33a-8dfe-4b20-a5f2-9d3d8b6d2dcd',
  })
  getCategory(@Query() query: GetQuestionsDto) {
    return this.service.getQuestions({
      ...query,
      currentCategory: query.currentCategory,
    });
  }

  @Throttle({ default: { limit: 60, ttl: 60 } })
  @Get('next-batch')
  @ApiOperation({
    summary: 'Récupérer le lot suivant de questions (système adaptatif)',
    description:
      "Sélectionne intelligemment le prochain lot de questions basé sur le profil intermédiaire de l'utilisateur",
  })
  @ApiQuery({
    name: 'sessionToken',
    required: true,
    description: 'Token de session actif.',
    example: '4ce2f33a-8dfe-4b20-a5f2-9d3d8b6d2dcd',
  })
  // @ApiStandardOkResponse({
  //     description: 'Lot adaptatif sélectionné.',
  //     dataExample: [
  //         {
  //             id: 42,
  //             riasecType: 'R',
  //             text: 'Question text',
  //             profiles: [
  //                 { riasecType: 'R', weight: 0.8 },
  //                 { riasecType: 'I', weight: 0.2 },
  //             ],
  //         },
  //     ],
  // })
  getNextBatch(@Query() query: GetNextBatchDto) {
    return this.service.getNextBatchQuestions(query);
  }
}
