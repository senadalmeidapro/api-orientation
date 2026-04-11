import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ResultsService } from './results.service';
import { ComputeResultDto } from './dto/compute-result.dto';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiTags('Results')
@UseGuards(JwtAuthGuard)
@Controller('results')
export class ResultsController {
    constructor(private readonly service: ResultsService) {}

    @Throttle({ default: { limit: 20, ttl: 60 } })
    @Post('compute')
    @ApiOperation({ summary: "Calculer les résultats d'un assessment" })
    @ApiResponse({ status: 201, description: 'Résultats calculés avec succès' })
    compute(@Body() dto: ComputeResultDto) {
        return this.service.compute(dto);
    }

    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Get('by-token/:sessionToken')
    @ApiOperation({ summary: 'Récupérer les résultats par token de session' })
    @ApiParam({ name: 'sessionToken', description: 'Token de session' })
    @ApiResponse({ status: 200, description: 'Résultats récupérés' })
    getByToken(@Param('sessionToken') sessionToken: string) {
        return this.service.getByToken(sessionToken);
    }

    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Get('by-assessment/:assessmentId')
    @ApiOperation({ summary: "Récupérer les résultats par ID d'assessment" })
    @ApiParam({ name: 'assessmentId', description: "ID de l'assessment" })
    @ApiResponse({ status: 200, description: 'Résultats récupérés' })
    getByAssessmentId(@Param('assessmentId') assessmentId: string) {
        return this.service.getByAssessmentId(assessmentId);
    }

    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Get(':sessionId')
    @ApiOperation({ summary: 'Récupérer les résultats par ID de session' })
    @ApiParam({ name: 'sessionId', description: 'ID de session (numérique)', type: 'integer' })
    @ApiResponse({ status: 200, description: 'Résultats récupérés' })
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
    @ApiParam({ name: 'assessmentId', description: "ID de l'assessment" })
    @ApiResponse({
        status: 200,
        description: 'Rapport enrichi généré',
        schema: {
            example: {
                assessmentId: 'clx123',
                generatedAt: '2026-04-08T10:30:00Z',
                riasecProfile: {
                    code: 'RIS',
                    scores: { R: 0.28, I: 0.22, A: 0.12, S: 0.18, E: 0.12, C: 0.08 },
                    dominant: [
                        { type: 'R', score: 28, percentage: 28.0 },
                        { type: 'I', score: 22, percentage: 22.0 },
                        { type: 'S', score: 18, percentage: 18.0 },
                    ],
                },
                behavioralAnalysis: {
                    dominantPattern: 'confident',
                    confidence: 0.75,
                    observations: ['Réponses rapides et décisives'],
                },
                psychologicalProfile: {
                    summary: 'Profil équilibré avec forte orientation pratique',
                    keyTraits: ['Confiant', 'Analytique', 'Pragmatique'],
                },
                careerRecommendations: ['Ingénierie', 'Recherche scientifique'],
                actionPlan: [
                    'Explorez les carrières techniques',
                    'Développez vos compétences analytiques',
                ],
            },
        },
    })
    @ApiResponse({ status: 404, description: 'Résultat de base non trouvé' })
    getEnhancedReport(@Param('assessmentId') assessmentId: string) {
        return this.service.computeEnhancedResult(assessmentId);
    }

    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Get('behavioral/:assessmentId')
    @ApiOperation({
        summary: 'Récupérer uniquement les observations comportementales',
        description: 'Liste formatée des observations comportementales pour un assessment',
    })
    @ApiParam({ name: 'assessmentId', description: "ID de l'assessment" })
    @ApiResponse({
        status: 200,
        description: 'Observations comportementales',
        schema: {
            example: [
                'Comportement dominant: confiant et décisif (confiance: 75%)',
                'Temps moyen de réponse: 4.3s',
                '5 réponses spontanées et enthousiastes',
                '8 réponses cohérentes et réfléchies',
            ],
        },
    })
    getBehavioralObservations(@Param('assessmentId') assessmentId: string) {
        return this.service.getBehavioralObservations(assessmentId);
    }
}
