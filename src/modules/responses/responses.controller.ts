import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { CreatePhase1ResponsesDto } from './dto/create-phase1-responses.dto';
import { CreatePhase2ResponsesDto } from './dto/create-phase2-responses.dto';
import { SubmitBatchResponsesDto } from './dto/submit-batch-responses.dto';
import { BehavioralAnalysisService } from './services/behavioral-analysis.service';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
// import {
//     ApiStandardCreatedResponse,
//     ApiStandardErrorResponses,
//     ApiStandardOkResponse,
// } from '@common/swagger';

@ApiTags('Responses')
@ApiBearerAuth('access-token')
// @ApiStandardErrorResponses({ includeUnauthorized: true, includeNotFound: true })
@Controller('api/v1/responses')
export class ResponsesController {
  constructor(
    private readonly service: ResponsesService,
    private readonly behavioralService: BehavioralAnalysisService,
  ) {}

  @Throttle({ default: { limit: 120, ttl: 60 } })
  @Post('phase1')
  @ApiOperation({
    summary: 'Enregistrer des réponses phase 1',
    description:
      'Enregistre ou met à jour un lot de réponses phase 1 pour la session/assessment fourni.',
  })
  @ApiBody({
    type: CreatePhase1ResponsesDto,
    description:
      'Token de session, assessmentId optionnel et liste des réponses (questionId, valeur, temps de réponse).',
  })
  // @ApiStandardCreatedResponse({
  //     description: 'Réponses phase 1 enregistrées.',
  //     dataExample: { saved: 6, phase1Completed: false },
  // })
  savePhase1(@Body() dto: CreatePhase1ResponsesDto) {
    return this.service.savePhase1(dto);
  }

  @Throttle({ default: { limit: 120, ttl: 60 } })
  @Post('phase2')
  @ApiOperation({
    summary: 'Enregistrer des réponses phase 2',
    description:
      'Enregistre ou met à jour un lot de réponses phase 2 pour la section active de l’assessment.',
  })
  @ApiBody({
    type: CreatePhase2ResponsesDto,
    description:
      'Token de session, assessmentId optionnel et liste des réponses phase 2 (questionId, responseValue).',
  })
  // @ApiStandardCreatedResponse({
  //     description: 'Réponses phase 2 enregistrées.',
  //     dataExample: { saved: 6, phase2Completed: true },
  // })
  savePhase2(@Body() dto: CreatePhase2ResponsesDto) {
    return this.service.savePhase2(dto);
  }

  @Throttle({ default: { limit: 60, ttl: 60 } })
  @Post('batch')
  @ApiOperation({
    summary: 'Soumettre un lot complet de réponses (système adaptatif)',
    description:
      "Enregistre les réponses d'un lot, effectue l'analyse comportementale et calcule le profil intermédiaire",
  })
  @ApiBody({
    type: SubmitBatchResponsesDto,
    description:
      'Lot complet de réponses adaptatives, incluant métadonnées comportementales (temps, changements, metadata).',
  })
  // @ApiStandardCreatedResponse({
  //     description: 'Lot adaptatif enregistré avec succès.',
  //     dataExample: {
  //         saved: 5,
  //         batchCompleted: true,
  //         intermediateProfile: {
  //             batchIndex: 2,
  //             profileData: { R: 0.28, I: 0.22, A: 0.15, S: 0.18, E: 0.1, C: 0.07 },
  //             dominantCode: 'RIS',
  //         },
  //         testComplete: false,
  //         completionPercentage: 45,
  //     },
  // })
  submitBatch(@Body() dto: SubmitBatchResponsesDto) {
    return this.service.submitBatchResponses(dto);
  }

  @Throttle({ default: { limit: 30, ttl: 60 } })
  @Get('behavioral/:assessmentId')
  @ApiOperation({
    summary: "Récupérer l'analyse comportementale",
    description: 'Obtient les insights comportementaux complets pour un assessment',
  })
  @ApiParam({
    name: 'assessmentId',
    description: "Identifiant de l'assessment.",
    example: 'clx-assessment-id',
  })
  // @ApiStandardOkResponse({
  //     description: 'Analyse comportementale récupérée.',
  //     dataExample: {
  //         dominantPattern: 'confident',
  //         confidence: 0.75,
  //         observations: ['5 réponses spontanées et rapides (31.2%)'],
  //         recommendations: ['Votre confiance est un atout: foncez vers vos objectifs'],
  //         metrics: {
  //             averageResponseTime: 4250,
  //             responseTimeStdDev: 1850,
  //             totalChanges: 3,
  //             hesitationCount: 2,
  //             doubtCount: 1,
  //             excitementCount: 5,
  //             consistentCount: 8,
  //         },
  //     },
  // })
  async getBehavioralInsights(@Param('assessmentId') assessmentId: string) {
    return this.behavioralService.generateBehavioralInsights(assessmentId);
  }
}
