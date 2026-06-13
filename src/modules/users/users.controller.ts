import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import { roles } from '@common/decorators/roles.decorator';
import { UpdateUserDto, UpdateUserRolesDto, UserResponseDto } from './dto';
import { UsersService } from './users.service';
import { UserHistoryService } from './user-history.service';
import {
  AssessmentDetailDto,
  AssessmentRecommendationsDto,
  UserHistoryDto,
} from '@modules/users/dto';
import { currentUser } from '@common/decorators';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponseDto } from '@common/dto/api-response.dto';
// import { ApiStandardErrorResponses, ApiStandardOkResponse } from '@common/swagger';

@ApiTags('Users')
@ApiBearerAuth('access-token')
// @ApiStandardErrorResponses({ includeUnauthorized: true })
@Controller('api/v1/users')
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly userHistory: UserHistoryService,
  ) {}

  @ApiOperation({
    summary: 'Récupérer le profil utilisateur courant',
    description:
      'Retourne les informations du compte associé au token JWT courant. Aucun paramètre de route, query ou body.',
  })
  // @ApiStandardOkResponse({
  //     description: 'Profil utilisateur courant récupéré.',
  //     model: UserResponseDto,
  //     message: 'Profil utilisateur récupéré.',
  // })
  @ApiNotFoundResponse({
    description: 'Utilisateur introuvable.',
    type: ApiErrorResponseDto,
    schema: {
      example: {
        success: false,
        statusCode: 404,
        message: 'Utilisateur introuvable',
        error: 'Not Found',
        path: '/users/me',
        timestamp: '2026-04-15T07:37:14.360Z',
      },
    },
  })
  @Throttle({ default: { limit: 30, ttl: 60 } })
  @Get('me')
  async me(@currentUser('id') id: string): Promise<UserResponseDto> {
    return this.users.findById(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HISTORIQUE UTILISATEUR
  // ═══════════════════════════════════════════════════════════════════════════

  @ApiOperation({
    summary: "Historique complet de l'utilisateur",
    description:
      "Retourne le profil de l'utilisateur connecté avec la totalité de ses sessions," +
      ' ses tests (résumés), son avancement dans la gamification (XP, niveau)' +
      " et ses badges déverrouillés. Données légères – idéal pour la page d'accueil du tableau de bord.",
  })
  @ApiNotFoundResponse({ description: 'Utilisateur introuvable.' })
  @Throttle({ default: { limit: 20, ttl: 60 } })
  @Get('me/history')
  async getHistory(@currentUser('id') id: string): Promise<UserHistoryDto> {
    return this.userHistory.getHistory(id);
  }

  @ApiOperation({
    summary: "Détail complet d'un test",
    description:
      "Retourne toutes les données d'un assessment spécifique : statut, pourcentage" +
      ' de complétion, résultats RIASEC détaillés (codes, scores, cohérence, différenciation,' +
      ' forces), métriques comportementales (temps de réponse, profil dominant) et' +
      " la carte au trésor si elle a été générée. Le test doit appartenir à l'utilisateur connecté.",
  })
  @ApiParam({
    name: 'assessmentId',
    description: 'Identifiant unique du test (CUID)',
    example: 'clx123abc0001',
  })
  @ApiNotFoundResponse({ description: "Test introuvable ou n'appartient pas à l'utilisateur." })
  @Throttle({ default: { limit: 30, ttl: 60 } })
  @Get('me/assessments/:assessmentId')
  async getAssessmentDetail(
    @currentUser('id') id: string,
    @Param('assessmentId') assessmentId: string,
  ): Promise<AssessmentDetailDto> {
    return this.userHistory.getAssessmentDetail(id, assessmentId);
  }

  @ApiOperation({
    summary: "Recommandations d'un test (métiers + formations + bourses)",
    description:
      'Retourne les recommandations de métiers générées pour un test terminé,' +
      " accompagnées des formations universitaires correspondantes et des bourses d'études" +
      ' disponibles pour chaque formation. Le test doit être COMPLETED et appartenir' +
      " à l'utilisateur connecté.",
  })
  @ApiParam({
    name: 'assessmentId',
    description: 'Identifiant unique du test',
    example: 'clx123abc0001',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Nombre de métiers à retourner (1–20, défaut : 6)',
    example: 6,
    type: Number,
  })
  @ApiNotFoundResponse({ description: "Test introuvable ou n'appartient pas à l'utilisateur." })
  @ApiForbiddenResponse({ description: "Le test n'est pas encore terminé." })
  @Throttle({ default: { limit: 20, ttl: 60 } })
  @Get('me/assessments/:assessmentId/recommendations')
  async getAssessmentRecommendations(
    @currentUser('id') id: string,
    @Param('assessmentId') assessmentId: string,
    @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit: number,
  ): Promise<AssessmentRecommendationsDto> {
    return this.userHistory.getAssessmentRecommendations(id, assessmentId, limit);
  }

  @ApiOperation({
    summary: 'Sauvegarder une bourse',
  })
  @ApiParam({
    name: 'scholarshipId',
    description: 'sauvegarder une bourse',
    example: 'clx123abc0001',
  })
  @ApiNotFoundResponse({})
  @ApiForbiddenResponse({})
  @Throttle({ default: { limit: 20, ttl: 60 } })
  @Post('me/scholarship')
  async addScholarshipToUser(
    @currentUser('id') id: string,
    @Param('scholarshipId') scholarshipId: number,
  ) {
    return this.userHistory.addScholarshipToUser(id, scholarshipId);
  }

  @ApiOperation({ summary: 'Récupérer la liste des bourses sauvegarder ' })
  @ApiQuery({
    name: 'scholarshipId',
    description: 'récupérer une bourse particulière',
    example: 'clx123abc0001',
  })
  @ApiNotFoundResponse({})
  @ApiForbiddenResponse({})
  @Throttle({ default: { limit: 20, ttl: 60 } })
  @Get('me/scholarship')
  async getScholarshipFromUser(
    @currentUser('id') id: string,
    @Query('scholarshipId') scholarshipId: number,
  ) {
    return this.userHistory.getScholarshipFromUser(id, scholarshipId);
  }
  @ApiOperation({ summary: 'Supprimer une bourse de la liste des bourse sauvegarder ' })
  @ApiParam({
    name: 'scholarshipId',
    description: 'supprimer une bourse particulière',
    example: 'clx123abc0001',
  })
  @ApiNotFoundResponse({})
  @ApiForbiddenResponse({})
  @Throttle({ default: { limit: 20, ttl: 60 } })
  @Delete('me/scholarship')
  async removeScholarshipFromUser(
    @currentUser('id') id: string,
    @Param('scholarshipId') scholarshipId: number,
  ) {
    return this.userHistory.removeScholarshipFromUser(id, scholarshipId);
  }

  @ApiOperation({
    summary: 'Lister les utilisateurs',
    description: 'Retourne la liste des utilisateurs visibles. Endpoint réservé au rôle ADMIN.',
  })
  // @ApiStandardOkResponse({
  //     description: 'Liste des utilisateurs récupérée.',
  //     model: UserResponseDto,
  //     isArray: true,
  //     message: 'Liste des utilisateurs récupérée.',
  // })
  @Throttle({ default: { limit: 20, ttl: 60 } })
  @roles(UserRole.ADMIN)
  @Get()
  list(): Promise<UserResponseDto[]> {
    return this.users.listUsers();
  }

  @ApiOperation({
    summary: 'Récupérer un utilisateur par identifiant',
    description:
      'Lit un utilisateur précis à partir du paramètre de route `userId`. Endpoint réservé au rôle ADMIN.',
  })
  @ApiParam({
    name: 'userId',
    description: 'Identifiant unique de l’utilisateur.',
    example: 'clx123abc0001',
  })
  // @ApiStandardOkResponse({
  //     description: 'Utilisateur récupéré.',
  //     model: UserResponseDto,
  //     message: 'Utilisateur récupéré.',
  // })
  @ApiNotFoundResponse({
    description: 'Utilisateur introuvable.',
    type: ApiErrorResponseDto,
    schema: {
      example: {
        success: false,
        statusCode: 404,
        message: 'Utilisateur introuvable',
        error: 'Not Found',
        path: '/users/clx123abc0001',
        timestamp: '2026-04-15T07:37:14.360Z',
      },
    },
  })
  @Throttle({ default: { limit: 20, ttl: 60 } })
  @roles(UserRole.ADMIN)
  @Get(':userId')
  getById(@Param('userId') userId: string): Promise<UserResponseDto> {
    return this.users.findById(userId);
  }

  @ApiOperation({
    summary: 'Mettre à jour un utilisateur',
    description:
      'Met à jour les champs autorisés du profil utilisateur ciblé (`displayName`, `bio`, `status`). Endpoint réservé ADMIN.',
  })
  @ApiParam({
    name: 'userId',
    description: 'Identifiant unique de l’utilisateur à modifier.',
    example: 'clx123abc0001',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Données partielles de mise à jour de l’utilisateur.',
  })
  // @ApiStandardOkResponse({
  //     description: 'Utilisateur mis à jour.',
  //     model: UserResponseDto,
  //     message: 'Utilisateur mis à jour.',
  // })
  @ApiNotFoundResponse({
    description: 'Utilisateur introuvable.',
    type: ApiErrorResponseDto,
    schema: {
      example: {
        success: false,
        statusCode: 404,
        message: 'Utilisateur introuvable',
        error: 'Not Found',
        path: '/users/clx123abc0001',
        timestamp: '2026-04-15T07:37:14.360Z',
      },
    },
  })
  @Throttle({ default: { limit: 20, ttl: 60 } })
  @roles(UserRole.ADMIN)
  @Patch(':userId')
  update(@Param('userId') userId: string, @Body() dto: UpdateUserDto): Promise<UserResponseDto> {
    return this.users.updateUser(userId, dto);
  }

  @ApiOperation({
    summary: 'Mettre à jour les rôles utilisateur',
    description:
      'Met à jour les rôles de l’utilisateur cible. La contrainte métier impose un seul rôle effectif. Endpoint réservé ADMIN.',
  })
  @ApiParam({
    name: 'userId',
    description: 'Identifiant unique de l’utilisateur à mettre à jour.',
    example: 'clx123abc0001',
  })
  @ApiBody({
    type: UpdateUserRolesDto,
    description: 'Liste de rôles à affecter (un seul rôle autorisé).',
  })
  // @ApiStandardOkResponse({
  //     description: 'Rôles utilisateur mis à jour.',
  //     model: UserResponseDto,
  //     message: 'Rôles utilisateur mis à jour.',
  // })
  @ApiNotFoundResponse({
    description: 'Utilisateur introuvable.',
    type: ApiErrorResponseDto,
    schema: {
      example: {
        success: false,
        statusCode: 404,
        message: 'Utilisateur introuvable',
        error: 'Not Found',
        path: '/users/clx123abc0001/roles',
        timestamp: '2026-04-15T07:37:14.360Z',
      },
    },
  })
  @Throttle({ default: { limit: 20, ttl: 60 } })
  @roles(UserRole.ADMIN)
  @Patch(':userId/roles')
  updateRoles(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserRolesDto,
  ): Promise<UserResponseDto> {
    return this.users.setUserRoles(userId, dto.roles);
  }
}
