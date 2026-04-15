import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { AbandonAssessmentDto, GetAssessmentDto } from './dto';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiStandardErrorResponses, ApiStandardOkResponse } from '../../common/swagger';

@ApiTags('Assessments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiStandardErrorResponses({ includeUnauthorized: true, includeNotFound: true })
@Controller('api/v1/assessments')
export class AssessmentsController {
    constructor(private readonly assessments: AssessmentsService) {}

    @ApiOperation({
        summary: 'Récupérer un assessment',
        description:
            'Retourne un assessment identifié par `assessmentId`, vérifié dans le contexte de la session passée en query.',
    })
    @ApiParam({
        name: 'assessmentId',
        description: "Identifiant de l'assessment.",
        example: 'clx-assessment-id',
    })
    @ApiQuery({
        name: 'sessionToken',
        required: true,
        description: 'Token de session lié à l’assessment.',
        example: '4ce2f33a-8dfe-4b20-a5f2-9d3d8b6d2dcd',
    })
    @ApiStandardOkResponse({
        description: 'Assessment récupéré.',
        dataExample: {
            id: 'clx-assessment-id',
            session_id: 'clx-session-id',
            status: 'IN_PROGRESS',
            type: 'PHASE1',
            completion_percentage: 25,
        },
    })
    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Get(':assessmentId')
    getById(@Param('assessmentId') assessmentId: string, @Query() query: GetAssessmentDto) {
        return this.assessments.getById(query.sessionToken, assessmentId);
    }

    @ApiOperation({
        summary: 'Récupérer la progression d’un assessment',
        description:
            'Retourne l’état courant de progression (phase, section, step, pourcentage) pour l’assessment ciblé.',
    })
    @ApiParam({
        name: 'assessmentId',
        description: "Identifiant de l'assessment.",
        example: 'clx-assessment-id',
    })
    @ApiQuery({
        name: 'sessionToken',
        required: true,
        description: 'Token de session lié à l’assessment.',
        example: '4ce2f33a-8dfe-4b20-a5f2-9d3d8b6d2dcd',
    })
    @ApiStandardOkResponse({
        description: 'Progression de l’assessment récupérée.',
        dataExample: {
            id: 'clx-assessment-id',
            status: 'IN_PROGRESS',
            type: 'PHASE2_OCCUPATIONS',
            currentPhase: 'PHASE2',
            currentSection: 'OCCUPATIONS',
            currentStepIndex: 12,
            completionPercentage: 60,
        },
    })
    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Get(':assessmentId/progress')
    getProgress(@Param('assessmentId') assessmentId: string, @Query() query: GetAssessmentDto) {
        return this.assessments.getProgress(query.sessionToken, assessmentId);
    }

    @ApiOperation({
        summary: 'Abandonner un assessment en cours',
        description:
            'Passe un assessment `IN_PROGRESS` au statut `ABANDONED` et renseigne sa date de fin.',
    })
    @ApiParam({
        name: 'assessmentId',
        description: "Identifiant de l'assessment.",
        example: 'clx-assessment-id',
    })
    @ApiBody({
        type: AbandonAssessmentDto,
        description: 'Token de session autorisé à abandonner cet assessment.',
    })
    @ApiStandardOkResponse({
        description: 'Assessment abandonné.',
        dataExample: {
            id: 'clx-assessment-id',
            status: 'ABANDONED',
            completed_at: '2026-04-15T07:37:14.360Z',
        },
    })
    @Throttle({ default: { limit: 20, ttl: 60 } })
    @Patch(':assessmentId/abandon')
    abandon(@Param('assessmentId') assessmentId: string, @Body() dto: AbandonAssessmentDto) {
        return this.assessments.abandon(dto.sessionToken, assessmentId);
    }
}
