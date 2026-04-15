import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ResultsService } from './results.service';
import { ComputeResultDto } from './dto/compute-result.dto';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { EnhancedReportDto } from './dto/enhanced-report.dto';
import {
    ApiStandardCreatedResponse,
    ApiStandardErrorResponses,
    ApiStandardOkResponse,
} from '../../common/swagger';

@ApiTags('Results')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiStandardErrorResponses({ includeUnauthorized: true, includeNotFound: true })
@Controller('api/v1/results')
export class ResultsController {
    constructor(private readonly service: ResultsService) {}

    @Throttle({ default: { limit: 20, ttl: 60 } })
    @Post('compute')
    @ApiOperation({
        summary: "Calculer (ou recalculer) les résultats d'un assessment",
        description:
            'Calcule les scores et le profil RIASEC à partir des réponses enregistrées, puis persiste le résultat.',
    })
    @ApiBody({
        type: ComputeResultDto,
        description:
            'Token de session requis, assessmentId optionnel, options de recalcul (`force`) et ranking subjectif.',
    })
    @ApiStandardCreatedResponse({
        description: 'Résultat calculé.',
        dataExample: {
            id: 'clx-result-id',
            assessment_id: 'clx-assessment-id',
            phase1_code: 'RIA',
            phase2_code: 'RIS',
            consistency_level: 'HIGH',
        },
    })
    compute(@Body() dto: ComputeResultDto) {
        return this.service.compute(dto);
    }

    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Get('by-token/:sessionToken')
    @ApiOperation({
        summary: 'Récupérer le dernier résultat par token de session',
        description:
            'Retourne le résultat le plus récent associé à la session identifiée par `sessionToken`.',
    })
    @ApiParam({
        name: 'sessionToken',
        description: 'Token de session.',
        example: '4ce2f33a-8dfe-4b20-a5f2-9d3d8b6d2dcd',
    })
    @ApiStandardOkResponse({
        description: 'Résultat récupéré par session token.',
        dataExample: {
            id: 'clx-result-id',
            assessment_id: 'clx-assessment-id',
            phase2_code: 'RIS',
            career_recommendations: [],
        },
    })
    getByToken(@Param('sessionToken') sessionToken: string) {
        return this.service.getByToken(sessionToken);
    }

    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Get('by-assessment/:assessmentId')
    @ApiOperation({
        summary: "Récupérer le résultat d'un assessment",
        description: "Retourne le résultat persistant lié à l'assessment demandé.",
    })
    @ApiParam({
        name: 'assessmentId',
        description: "Identifiant de l'assessment.",
        example: 'clx-assessment-id',
    })
    @ApiStandardOkResponse({
        description: 'Résultat récupéré par assessment.',
        dataExample: {
            id: 'clx-result-id',
            assessment_id: 'clx-assessment-id',
            phase1_code: 'RIA',
            phase2_code: 'RIS',
        },
    })
    getByAssessmentId(@Param('assessmentId') assessmentId: string) {
        return this.service.getByAssessmentId(assessmentId);
    }

    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Get(':sessionId')
    @ApiOperation({
        summary: 'Récupérer le dernier résultat par identifiant de session',
        description:
            "Retourne le résultat le plus récent pour l'identifiant interne de session (`sessionId`).",
    })
    @ApiParam({
        name: 'sessionId',
        description: 'Identifiant interne de session (string ID Prisma).',
        example: 'clx-session-id',
    })
    @ApiStandardOkResponse({
        description: 'Résultat récupéré par sessionId.',
        dataExample: {
            id: 'clx-result-id',
            assessment_id: 'clx-assessment-id',
            phase2_code: 'RIS',
        },
    })
    getBySessionId(@Param('sessionId') sessionId: string) {
        return this.service.getBySessionId(sessionId);
    }

    @Throttle({ default: { limit: 20, ttl: 60 } })
    @Get('enhanced/:assessmentId')
    @ApiOperation({
        summary: 'Générer un rapport enrichi avec analyse comportementale',
        description:
            'Rapport complet incluant profil RIASEC, analyse psychologique, observations comportementales et recommandations personnalisées',
    })
    @ApiParam({
        name: 'assessmentId',
        description: "Identifiant de l'assessment.",
        example: 'clx-assessment-id',
    })
    @ApiStandardOkResponse({
        description: 'Rapport enrichi généré.',
        model: EnhancedReportDto,
    })
    getEnhancedReport(@Param('assessmentId') assessmentId: string) {
        return this.service.computeEnhancedResult(assessmentId);
    }

    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Get('behavioral/:assessmentId')
    @ApiOperation({
        summary: 'Récupérer uniquement les observations comportementales',
        description: 'Liste formatée des observations comportementales pour un assessment',
    })
    @ApiParam({
        name: 'assessmentId',
        description: "Identifiant de l'assessment.",
        example: 'clx-assessment-id',
    })
    @ApiStandardOkResponse({
        description: 'Observations comportementales récupérées.',
        dataExample: [
            'Comportement dominant: confiant et décisif (confiance: 75%)',
            'Temps moyen de réponse: 4.3s',
            '5 réponses spontanées et enthousiastes',
            '8 réponses cohérentes et réfléchies',
        ],
    })
    getBehavioralObservations(@Param('assessmentId') assessmentId: string) {
        return this.service.getBehavioralObservations(assessmentId);
    }
}
