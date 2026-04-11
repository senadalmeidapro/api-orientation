import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { CreatePhase1ResponsesDto } from './dto/create-phase1-responses.dto';
import { CreatePhase2ResponsesDto } from './dto/create-phase2-responses.dto';
import { SubmitBatchResponsesDto } from './dto/submit-batch-responses.dto';
import { BehavioralAnalysisService } from './services/behavioral-analysis.service';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UseGuards } from '@nestjs/common';

@ApiTags('Responses')
@UseGuards(JwtAuthGuard)
@Controller('responses')
export class ResponsesController {
    constructor(
        private readonly service: ResponsesService,
        private readonly behavioralService: BehavioralAnalysisService,
    ) {}

    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Post('phase1')
    @ApiOperation({ summary: 'Enregistrer les réponses Phase 1' })
    @ApiResponse({ status: 201, description: 'Réponses Phase 1 enregistrées' })
    savePhase1(@Body() dto: CreatePhase1ResponsesDto) {
        return this.service.savePhase1(dto);
    }

    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Post('phase2')
    @ApiOperation({ summary: 'Enregistrer les réponses Phase 2' })
    @ApiResponse({ status: 201, description: 'Réponses Phase 2 enregistrées' })
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
    @ApiResponse({
        status: 201,
        description: 'Lot enregistré avec succès',
        schema: {
            example: {
                saved: 5,
                batchCompleted: true,
                intermediateProfile: {
                    batchIndex: 2,
                    profileData: { R: 0.28, I: 0.22, A: 0.15, S: 0.18, E: 0.1, C: 0.07 },
                    dominantCode: 'RIS',
                },
                testComplete: false,
                completionPercentage: 45,
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Lot invalide ou incomplet' })
    submitBatch(@Body() dto: SubmitBatchResponsesDto) {
        return this.service.submitBatchResponses(dto);
    }

    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Get('behavioral/:assessmentId')
    @ApiOperation({
        summary: "Récupérer l'analyse comportementale",
        description: 'Obtient les insights comportementaux complets pour un assessment',
    })
    @ApiParam({ name: 'assessmentId', description: "ID de l'assessment" })
    @ApiResponse({
        status: 200,
        description: 'Analyse comportementale récupérée',
        schema: {
            example: {
                dominantPattern: 'confident',
                confidence: 0.75,
                observations: ['5 réponses spontanées et rapides (31.2%)'],
                recommendations: ['Votre confiance est un atout: foncez vers vos objectifs'],
                metrics: {
                    averageResponseTime: 4250,
                    responseTimeStdDev: 1850,
                    totalChanges: 3,
                    hesitationCount: 2,
                    doubtCount: 1,
                    excitementCount: 5,
                    consistentCount: 8,
                },
            },
        },
    })
    async getBehavioralInsights(@Param('assessmentId') assessmentId: string) {
        return this.behavioralService.generateBehavioralInsights(assessmentId);
    }
}
