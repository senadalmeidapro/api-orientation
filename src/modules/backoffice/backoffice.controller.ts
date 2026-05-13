import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { roles } from '@common/decorators/roles.decorator';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '@modules/auth/guards/jwt.guard';
import { BackofficeService } from './backoffice.service';
import { DashboardSummaryDto } from './dto/dashboard-summary.dto';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import {
  AdminAssessmentsFilterDto,
  AdminPhase1QuestionsFilterDto,
  AdminPhase2QuestionsFilterDto,
  AdminSessionsFilterDto,
  AdminUsersFilterDto,
} from './dto/admin-filters.dto';
import {
  CreatePhase1QuestionAdminDto,
  CreatePhase2QuestionAdminDto,
  UpdatePhase1QuestionAdminDto,
  UpdatePhase2QuestionAdminDto,
} from './dto/manage-questions.dto';
import { AdminPaginationDto } from './dto/admin-pagination.dto';
import { UsersService } from '@modules/users/users.service';
import { UpdateUserDto, UpdateUserRolesDto } from '@modules/users/dto';
import { CareersService } from '@modules/careers/careers.service';
import { CreateCareerDto, ListCareersDto, UpdateCareerDto } from '@modules/careers/dto';
import { ResourcesService } from '@modules/resources/resources.service';
import { CreateResourceDto, ListResourcesDto, UpdateResourceDto } from '@modules/resources/dto';
import { UniversitiesService } from '@modules/universities/universities.service';
import {
  CreateFormationDto,
  CreateScholarshipDto,
  CreateUniversityDto,
  UpdateFormationDto,
  UpdateScholarshipDto,
  UpdateUniversityDto,
} from '@modules/universities/dto';

@ApiTags('Backoffice')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@roles(UserRole.ADMIN)
@Controller('api/v1/backoffice')
export class BackofficeController {
  constructor(
    private readonly backofficeService: BackofficeService,
    private readonly usersService: UsersService,
    private readonly careersService: CareersService,
    private readonly resourcesService: ResourcesService,
    private readonly universitiesService: UniversitiesService,
  ) {}

  @ApiOperation({ summary: 'Synthèse KPI back-office' })
  @Throttle({ default: { limit: 20, ttl: 60 } })
  @Get('dashboard')
  getDashboardSummary(@Query() query: DashboardQueryDto): Promise<DashboardSummaryDto> {
    return this.backofficeService.getDashboardSummary(query);
  }

  @ApiOperation({ summary: 'Lister les utilisateurs (admin)' })
  @Get('users')
  listUsers(@Query() dto: AdminUsersFilterDto) {
    return this.backofficeService.listUsers(dto);
  }

  @ApiOperation({ summary: 'Détail utilisateur (admin)' })
  @Get('users/:userId')
  getUser(@Param('userId') userId: string) {
    return this.usersService.findById(userId);
  }

  @ApiOperation({ summary: 'Mettre à jour un utilisateur (admin)' })
  @Patch('users/:userId')
  updateUser(@Param('userId') userId: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(userId, dto);
  }

  @ApiOperation({ summary: 'Mettre à jour le rôle utilisateur (admin)' })
  @Patch('users/:userId/roles')
  updateUserRoles(@Param('userId') userId: string, @Body() dto: UpdateUserRolesDto) {
    return this.usersService.setUserRoles(userId, dto.roles);
  }

  @ApiOperation({ summary: 'Lister les sessions (admin)' })
  @Get('sessions')
  listSessions(@Query() dto: AdminSessionsFilterDto) {
    return this.backofficeService.listSessions(dto);
  }

  @ApiOperation({ summary: 'Lister les assessments (admin)' })
  @Get('assessments')
  listAssessments(@Query() dto: AdminAssessmentsFilterDto) {
    return this.backofficeService.listAssessments(dto);
  }

  @ApiOperation({ summary: 'Lister les questions phase 1 (admin)' })
  @Get('questions/phase1')
  listPhase1Questions(@Query() dto: AdminPhase1QuestionsFilterDto) {
    return this.backofficeService.listPhase1Questions(dto);
  }

  @ApiOperation({ summary: 'Créer une question phase 1 (admin)' })
  @Post('questions/phase1')
  createPhase1Question(@Body() dto: CreatePhase1QuestionAdminDto) {
    return this.backofficeService.createPhase1Question(dto);
  }

  @ApiOperation({ summary: 'Mettre à jour une question phase 1 (admin)' })
  @Patch('questions/phase1/:id')
  updatePhase1Question(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePhase1QuestionAdminDto,
  ) {
    return this.backofficeService.updatePhase1Question(id, dto);
  }

  @ApiOperation({ summary: 'Lister les questions phase 2 (admin)' })
  @Get('questions/phase2')
  listPhase2Questions(@Query() dto: AdminPhase2QuestionsFilterDto) {
    return this.backofficeService.listPhase2Questions(dto);
  }

  @ApiOperation({ summary: 'Créer une question phase 2 (admin)' })
  @Post('questions/phase2')
  createPhase2Question(@Body() dto: CreatePhase2QuestionAdminDto) {
    return this.backofficeService.createPhase2Question(dto);
  }

  @ApiOperation({ summary: 'Mettre à jour une question phase 2 (admin)' })
  @Patch('questions/phase2/:id')
  updatePhase2Question(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePhase2QuestionAdminDto,
  ) {
    return this.backofficeService.updatePhase2Question(id, dto);
  }

  @ApiOperation({ summary: 'Lister les carrières (admin)' })
  @Get('careers')
  listCareers(@Query() dto: ListCareersDto) {
    return this.careersService.list(dto);
  }

  @ApiOperation({ summary: 'Créer une carrière (admin)' })
  @Post('careers')
  createCareer(@Body() dto: CreateCareerDto) {
    return this.careersService.create(dto);
  }

  @ApiOperation({ summary: 'Mettre à jour une carrière (admin)' })
  @Patch('careers/:id')
  updateCareer(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCareerDto) {
    return this.careersService.update(id, dto);
  }

  @ApiOperation({ summary: 'Supprimer (désactiver) une carrière (admin)' })
  @Delete('careers/:id')
  deleteCareer(@Param('id', ParseIntPipe) id: number) {
    return this.careersService.deactivate(id);
  }

  @ApiOperation({ summary: 'Lister les ressources (admin)' })
  @Get('resources')
  listResources(@Query() dto: ListResourcesDto) {
    return this.resourcesService.list(dto);
  }

  @ApiOperation({ summary: 'Créer une ressource (admin)' })
  @Post('resources')
  createResource(@Body() dto: CreateResourceDto) {
    return this.resourcesService.create(dto);
  }

  @ApiOperation({ summary: 'Mettre à jour une ressource (admin)' })
  @Patch('resources/:id')
  updateResource(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateResourceDto) {
    return this.resourcesService.update(id, dto);
  }

  @ApiOperation({ summary: 'Supprimer une ressource (admin)' })
  @Delete('resources/:id')
  deleteResource(@Param('id', ParseIntPipe) id: number) {
    return this.resourcesService.remove(id);
  }

  @ApiOperation({ summary: 'Créer une université (admin)' })
  @Post('universities')
  createUniversity(@Body() dto: CreateUniversityDto) {
    return this.universitiesService.createUniversity(dto);
  }

  @ApiOperation({ summary: 'Lister les universités (admin)' })
  @Get('universities')
  listUniversities() {
    return this.universitiesService.findAllUniversities();
  }

  @ApiOperation({ summary: 'Mettre à jour une université (admin)' })
  @Patch('universities/:id')
  updateUniversity(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUniversityDto) {
    return this.universitiesService.updateUniversity(id, dto);
  }

  @ApiOperation({ summary: 'Supprimer une université (admin)' })
  @Delete('universities/:id')
  deleteUniversity(@Param('id', ParseIntPipe) id: number) {
    return this.universitiesService.deleteUniversity(id);
  }

  @ApiOperation({ summary: 'Créer une formation (admin)' })
  @Post('formations')
  createFormation(@Body() dto: CreateFormationDto) {
    return this.universitiesService.createFormation(dto);
  }

  @ApiOperation({ summary: 'Mettre à jour une formation (admin)' })
  @Patch('formations/:id')
  updateFormation(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFormationDto) {
    return this.universitiesService.updateFormation(id, dto);
  }

  @ApiOperation({ summary: 'Lister les formations (admin)' })
  @Get('formations')
  listFormations(@Query('universityId') universityId?: string) {
    return universityId
      ? this.universitiesService.findAllFormationsByUniversity(Number(universityId))
      : this.universitiesService.findAllFormations();
  }

  @ApiOperation({ summary: 'Supprimer une formation (admin)' })
  @Delete('formations/:id')
  deleteFormation(@Param('id', ParseIntPipe) id: number) {
    return this.universitiesService.deleteFormation(id);
  }

  @ApiOperation({ summary: 'Créer une bourse (admin)' })
  @Post('scholarships')
  createScholarship(@Body() dto: CreateScholarshipDto) {
    return this.universitiesService.createScholarship(dto);
  }

  @ApiOperation({ summary: 'Mettre à jour une bourse (admin)' })
  @Patch('scholarships/:id')
  updateScholarship(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateScholarshipDto) {
    return this.universitiesService.updateScholarship(id, dto);
  }

  @ApiOperation({ summary: 'Lister les bourses (admin)' })
  @Get('scholarships')
  listScholarships() {
    return this.universitiesService.findAllScholarships();
  }

  @ApiOperation({ summary: 'Supprimer une bourse (admin)' })
  @Delete('scholarships/:id')
  deleteScholarship(@Param('id', ParseIntPipe) id: number) {
    return this.universitiesService.deleteScholarship(id);
  }

  @ApiOperation({ summary: 'Lister les réponses phase 1 (admin)' })
  @Get('responses/phase1')
  listPhase1Responses(@Query() dto: AdminPaginationDto) {
    return this.backofficeService.listPhase1Responses(dto);
  }

  @ApiOperation({ summary: 'Lire réponse phase 1 (admin)' })
  @Get('responses/phase1/:id')
  getPhase1Response(@Param('id') id: string) {
    return this.backofficeService.getPhase1Response(id);
  }

  @ApiOperation({ summary: 'Supprimer réponse phase 1 (admin)' })
  @Delete('responses/phase1/:id')
  deletePhase1Response(@Param('id') id: string) {
    return this.backofficeService.deletePhase1Response(id);
  }

  @ApiOperation({ summary: 'Lister les réponses phase 2 (admin)' })
  @Get('responses/phase2')
  listPhase2Responses(@Query() dto: AdminPaginationDto) {
    return this.backofficeService.listPhase2Responses(dto);
  }

  @ApiOperation({ summary: 'Lire réponse phase 2 (admin)' })
  @Get('responses/phase2/:id')
  getPhase2Response(@Param('id') id: string) {
    return this.backofficeService.getPhase2Response(id);
  }

  @ApiOperation({ summary: 'Supprimer réponse phase 2 (admin)' })
  @Delete('responses/phase2/:id')
  deletePhase2Response(@Param('id') id: string) {
    return this.backofficeService.deletePhase2Response(id);
  }

  @ApiOperation({ summary: 'Lister les résultats (admin)' })
  @Get('results')
  listResults(@Query() dto: AdminPaginationDto) {
    return this.backofficeService.listResults(dto);
  }

  @ApiOperation({ summary: 'Lire un résultat (admin)' })
  @Get('results/:id')
  getResult(@Param('id') id: string) {
    return this.backofficeService.getResult(id);
  }

  @ApiOperation({ summary: 'Supprimer un résultat (admin)' })
  @Delete('results/:id')
  deleteResult(@Param('id') id: string) {
    return this.backofficeService.deleteResult(id);
  }

  @ApiOperation({ summary: 'Lister les recommandations (admin)' })
  @Get('recommendations')
  listRecommendations(@Query() dto: AdminPaginationDto) {
    return this.backofficeService.listRecommendations(dto);
  }

  @ApiOperation({ summary: 'Supprimer une recommandation (admin)' })
  @Delete('recommendations/:id')
  deleteRecommendation(@Param('id') id: string) {
    return this.backofficeService.deleteRecommendation(id);
  }

  @ApiOperation({ summary: 'Lister les badges (admin)' })
  @Get('badges')
  listBadges(@Query() dto: AdminPaginationDto) {
    return this.backofficeService.listBadges(dto);
  }

  @ApiOperation({ summary: 'Lire un badge (admin)' })
  @Get('badges/:id')
  getBadge(@Param('id', ParseIntPipe) id: number) {
    return this.backofficeService.getBadge(id);
  }

  @ApiOperation({ summary: 'Supprimer un badge (admin)' })
  @Delete('badges/:id')
  deleteBadge(@Param('id', ParseIntPipe) id: number) {
    return this.backofficeService.deleteBadge(id);
  }

  @ApiOperation({ summary: 'Lister les cartes au trésor (admin)' })
  @Get('treasure-maps')
  listTreasureMaps(@Query() dto: AdminPaginationDto) {
    return this.backofficeService.listTreasureMaps(dto);
  }

  @ApiOperation({ summary: 'Supprimer carte au trésor (admin)' })
  @Delete('treasure-maps/:id')
  deleteTreasureMap(@Param('id') id: string) {
    return this.backofficeService.deleteTreasureMap(id);
  }

  @ApiOperation({ summary: 'Lister les feedbacks (admin)' })
  @Get('feedbacks')
  listFeedbacks(@Query() dto: AdminPaginationDto) {
    return this.backofficeService.listFeedbacks(dto);
  }

  @ApiOperation({ summary: 'Lire un feedback (admin)' })
  @Get('feedbacks/:id')
  getFeedback(@Param('id') id: string) {
    return this.backofficeService.getFeedback(id);
  }

  @ApiOperation({ summary: 'Créer un feedback (admin)' })
  @Post('feedbacks')
  createFeedback(@Body() dto: Record<string, unknown>) {
    return this.backofficeService.createFeedback(dto);
  }

  @ApiOperation({ summary: 'Mettre à jour un feedback (admin)' })
  @Patch('feedbacks/:id')
  updateFeedback(@Param('id') id: string, @Body() dto: Record<string, unknown>) {
    return this.backofficeService.updateFeedback(id, dto);
  }

  @ApiOperation({ summary: 'Supprimer un feedback (admin)' })
  @Delete('feedbacks/:id')
  deleteFeedback(@Param('id') id: string) {
    return this.backofficeService.deleteFeedback(id);
  }

  @ApiOperation({ summary: 'Lister les outcomes (admin)' })
  @Get('outcomes')
  listOutcomes(@Query() dto: AdminPaginationDto) {
    return this.backofficeService.listOutcomes(dto);
  }

  @ApiOperation({ summary: 'Lire un outcome (admin)' })
  @Get('outcomes/:id')
  getOutcome(@Param('id') id: string) {
    return this.backofficeService.getOutcome(id);
  }

  @ApiOperation({ summary: 'Créer un outcome (admin)' })
  @Post('outcomes')
  createOutcome(@Body() dto: Record<string, unknown>) {
    return this.backofficeService.createOutcome(dto);
  }

  @ApiOperation({ summary: 'Mettre à jour un outcome (admin)' })
  @Patch('outcomes/:id')
  updateOutcome(@Param('id') id: string, @Body() dto: Record<string, unknown>) {
    return this.backofficeService.updateOutcome(id, dto);
  }

  @ApiOperation({ summary: 'Supprimer un outcome (admin)' })
  @Delete('outcomes/:id')
  deleteOutcome(@Param('id') id: string) {
    return this.backofficeService.deleteOutcome(id);
  }

  @ApiOperation({ summary: 'Lister les interactions (admin)' })
  @Get('interactions')
  listInteractions(@Query() dto: AdminPaginationDto) {
    return this.backofficeService.listInteractions(dto);
  }

  @ApiOperation({ summary: 'Lire une interaction (admin)' })
  @Get('interactions/:id')
  getInteraction(@Param('id') id: string) {
    return this.backofficeService.getInteraction(id);
  }

  @ApiOperation({ summary: 'Créer une interaction (admin)' })
  @Post('interactions')
  createInteraction(@Body() dto: Record<string, unknown>) {
    return this.backofficeService.createInteraction(dto);
  }

  @ApiOperation({ summary: 'Mettre à jour une interaction (admin)' })
  @Patch('interactions/:id')
  updateInteraction(@Param('id') id: string, @Body() dto: Record<string, unknown>) {
    return this.backofficeService.updateInteraction(id, dto);
  }

  @ApiOperation({ summary: 'Supprimer une interaction (admin)' })
  @Delete('interactions/:id')
  deleteInteraction(@Param('id') id: string) {
    return this.backofficeService.deleteInteraction(id);
  }

  @ApiOperation({ summary: 'Lister les badges attribués aux sessions (admin)' })
  @Get('session-badges')
  listSessionBadges(@Query() dto: AdminPaginationDto) {
    return this.backofficeService.listSessionBadges(dto);
  }

  @ApiOperation({ summary: 'Lire un session-badge (admin)' })
  @Get('session-badges/:id')
  getSessionBadge(@Param('id') id: string) {
    return this.backofficeService.getSessionBadge(id);
  }

  @ApiOperation({ summary: 'Créer un session-badge (admin)' })
  @Post('session-badges')
  createSessionBadge(@Body() dto: Record<string, unknown>) {
    return this.backofficeService.createSessionBadge(dto);
  }

  @ApiOperation({ summary: 'Mettre à jour un session-badge (admin)' })
  @Patch('session-badges/:id')
  updateSessionBadge(@Param('id') id: string, @Body() dto: Record<string, unknown>) {
    return this.backofficeService.updateSessionBadge(id, dto);
  }

  @ApiOperation({ summary: 'Supprimer un session-badge (admin)' })
  @Delete('session-badges/:id')
  deleteSessionBadge(@Param('id') id: string) {
    return this.backofficeService.deleteSessionBadge(id);
  }

  @ApiOperation({ summary: 'Lister l’historique XP (admin)' })
  @Get('xp-history')
  listXpHistory(@Query() dto: AdminPaginationDto) {
    return this.backofficeService.listXpHistory(dto);
  }

  @ApiOperation({ summary: 'Lire une entrée XP history (admin)' })
  @Get('xp-history/:id')
  getXpHistory(@Param('id') id: string) {
    return this.backofficeService.getXpHistory(id);
  }

  @ApiOperation({ summary: 'Créer une entrée XP history (admin)' })
  @Post('xp-history')
  createXpHistory(@Body() dto: Record<string, unknown>) {
    return this.backofficeService.createXpHistory(dto);
  }

  @ApiOperation({ summary: 'Mettre à jour une entrée XP history (admin)' })
  @Patch('xp-history/:id')
  updateXpHistory(@Param('id') id: string, @Body() dto: Record<string, unknown>) {
    return this.backofficeService.updateXpHistory(id, dto);
  }

  @ApiOperation({ summary: 'Supprimer une entrée XP history (admin)' })
  @Delete('xp-history/:id')
  deleteXpHistory(@Param('id') id: string) {
    return this.backofficeService.deleteXpHistory(id);
  }
}
