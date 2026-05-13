import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionTokenParam } from './dto/session-token.param';
import { Throttle } from '@nestjs/throttler';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateSessionProfileDto } from './dto/update-session-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { currentUser } from '@common/decorators';
import type { User } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponseDto } from '@common/dto/api-response.dto';
// import {
//     ApiStandardCreatedResponse,
//     ApiStandardErrorResponses,
//     ApiStandardOkResponse,
// } from '@common/swagger';

@ApiTags('Sessions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
// @ApiStandardErrorResponses({ includeUnauthorized: true })
@Controller('api/v1/sessions')
export class SessionsController {
  constructor(private readonly service: SessionsService) {}

  @ApiOperation({
    summary: 'Créer une session de test',
    description:
      'Crée une session liée à l’utilisateur authentifié et initialise un assessment selon les paramètres reçus.',
  })
  @ApiBody({
    type: CreateSessionDto,
    description:
      'Configuration initiale de session (version de test, type d’assessment, profondeur, profil utilisateur).',
  })
  // @ApiStandardCreatedResponse({
  //     description: 'Session créée avec son assessment initial.',
  //     dataExample: {
  //         sessionId: 'clx-session-id',
  //         sessionToken: '4ce2f33a-8dfe-4b20-a5f2-9d3d8b6d2dcd',
  //         shareToken: '3c96a7a8-5ab8-4f2b-a62e-a6f44c37250d',
  //         startedAt: '2026-04-15T07:37:14.360Z',
  //         assessment: {
  //             id: 'clx-assessment-id',
  //             type: 'PHASE1',
  //             status: 'IN_PROGRESS',
  //             depth: 5,
  //         },
  //     },
  // })
  @ApiNotFoundResponse({
    description: 'Utilisateur introuvable ou version de test demandée absente.',
    type: ApiErrorResponseDto,
  })
  @Throttle({ default: { limit: 30, ttl: 60 } })
  @Post()
  create(@currentUser() user: User, @Body() dto: CreateSessionDto) {
    return this.service.createSession(user.id, dto);
  }

  @ApiOperation({
    summary: 'Récupérer une session par token',
    description:
      'Retourne la session (avec assessments et résultats associés) à partir du token de session.',
  })
  @ApiParam({
    name: 'sessionToken',
    description: 'Token de session UUID.',
    example: '4ce2f33a-8dfe-4b20-a5f2-9d3d8b6d2dcd',
  })
  // @ApiStandardOkResponse({
  //     description: 'Session récupérée.',
  //     dataExample: {
  //         id: 'clx-session-id',
  //         session_token: '4ce2f33a-8dfe-4b20-a5f2-9d3d8b6d2dcd',
  //         share_token: '3c96a7a8-5ab8-4f2b-a62e-a6f44c37250d',
  //         assessments: [],
  //     },
  // })
  @ApiNotFoundResponse({
    description: 'Session introuvable.',
    type: ApiErrorResponseDto,
  })
  @Throttle({ default: { limit: 60, ttl: 60 } })
  @Get(':sessionToken')
  getByToken(@Param() params: SessionTokenParam) {
    return this.service.getByToken(params.sessionToken);
  }

  @ApiOperation({
    summary: 'Créer un assessment pour une session',
    description: 'Crée un nouvel assessment rattaché à la session identifiée par `sessionToken`.',
  })
  @ApiParam({
    name: 'sessionToken',
    description: 'Token de session UUID.',
    example: '4ce2f33a-8dfe-4b20-a5f2-9d3d8b6d2dcd',
  })
  @ApiBody({
    type: CreateAssessmentDto,
    description: 'Type d’assessment à créer et paramètres de profondeur/version.',
  })
  // @ApiStandardCreatedResponse({
  //     description: 'Assessment créé.',
  //     dataExample: {
  //         id: 'clx-assessment-id',
  //         session_id: 'clx-session-id',
  //         type: 'PHASE2_OCCUPATIONS',
  //         status: 'IN_PROGRESS',
  //     },
  // })
  @ApiNotFoundResponse({
    description: 'Session introuvable ou prérequis de phase non satisfaits.',
    type: ApiErrorResponseDto,
  })
  @Throttle({ default: { limit: 30, ttl: 60 } })
  @Post(':sessionToken/assessments')
  createAssessment(@Param() params: SessionTokenParam, @Body() dto: CreateAssessmentDto) {
    return this.service.createAssessmentForSession(params.sessionToken, dto);
  }

  @ApiOperation({
    summary: 'Lister les assessments d’une session',
    description: 'Retourne les assessments d’une session triés du plus récent au plus ancien.',
  })
  @ApiParam({
    name: 'sessionToken',
    description: 'Token de session UUID.',
    example: '4ce2f33a-8dfe-4b20-a5f2-9d3d8b6d2dcd',
  })
  // @ApiStandardOkResponse({
  //     description: 'Liste des assessments récupérée.',
  //     dataExample: [
  //         {
  //             id: 'clx-assessment-id',
  //             type: 'PHASE1',
  //             status: 'COMPLETED',
  //         },
  //     ],
  // })
  @ApiNotFoundResponse({
    description: 'Session introuvable.',
    type: ApiErrorResponseDto,
  })
  @Throttle({ default: { limit: 60, ttl: 60 } })
  @Get(':sessionToken/assessments')
  listAssessments(@Param() params: SessionTokenParam) {
    return this.service.listAssessments(params.sessionToken);
  }

  @ApiOperation({
    summary: 'Mettre à jour le profil d’une session',
    description:
      'Met à jour les informations de profil associées à la session ciblée (si session rattachée à un utilisateur).',
  })
  @ApiParam({
    name: 'sessionToken',
    description: 'Token de session UUID.',
    example: '4ce2f33a-8dfe-4b20-a5f2-9d3d8b6d2dcd',
  })
  @ApiBody({
    type: UpdateSessionProfileDto,
    description: 'Objet `profile` contenant les informations à propager.',
  })
  // @ApiStandardOkResponse({
  //     description: 'Profil de session mis à jour.',
  //     dataExample: {
  //         id: 'clx-session-id',
  //         session_token: '4ce2f33a-8dfe-4b20-a5f2-9d3d8b6d2dcd',
  //         user_id: 'clx-user-id',
  //     },
  // })
  @ApiNotFoundResponse({
    description: 'Session introuvable.',
    type: ApiErrorResponseDto,
  })
  @Throttle({ default: { limit: 30, ttl: 60 } })
  @Patch(':sessionToken/profile')
  updateProfile(@Param() params: SessionTokenParam, @Body() dto: UpdateSessionProfileDto) {
    return this.service.updateProfile(params.sessionToken, dto);
  }
}
