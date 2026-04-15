import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { Throttle } from '@nestjs/throttler';
import { AnalyticsService } from './analytics.service';
import {
    AnalyticsSummaryDto,
    CreateFeedbackDto,
    CreateInteractionDto,
    CreateOutcomeDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
    ApiStandardCreatedResponse,
    ApiStandardErrorResponses,
    ApiStandardOkResponse,
} from '../../common/swagger';

@ApiTags('Analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiStandardErrorResponses({ includeUnauthorized: true, includeNotFound: true })
@Controller('api/v1/analytics')
export class AnalyticsController {
    constructor(private readonly analytics: AnalyticsService) {}

    @ApiOperation({
        summary: 'Creer - Create Interaction',
        description: 'Endpoint pour create interaction.',
    })
    @ApiBody({
        type: CreateInteractionDto,
        description: 'Événement d’interaction utilisateur lié à une session/assessment.',
    })
    @ApiStandardCreatedResponse({
        description: 'Interaction enregistrée.',
        dataExample: {
            id: 'clx-interaction-id',
            type: 'CLICK',
            entity_type: 'career',
            entity_id: '12',
            value: 1,
        },
    })
    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Post('interactions')
    createInteraction(@Body() dto: CreateInteractionDto) {
        return this.analytics.createInteraction(dto);
    }

    @ApiOperation({
        summary: 'Creer - Create Feedback',
        description: 'Endpoint pour create feedback.',
    })
    @ApiBody({
        type: CreateFeedbackDto,
        description: 'Feedback utilisateur sur une recommandation ou un parcours.',
    })
    @ApiStandardCreatedResponse({
        description: 'Feedback enregistré.',
        dataExample: {
            id: 'clx-feedback-id',
            type: 'LIKED',
            recommendationId: 'clx-recommendation-id',
            value: 1,
        },
    })
    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Post('feedbacks')
    createFeedback(@Body() dto: CreateFeedbackDto) {
        return this.analytics.createFeedback(dto);
    }

    @ApiOperation({
        summary: 'Creer - Create Outcome',
        description: 'Endpoint pour create outcome.',
    })
    @ApiBody({
        type: CreateOutcomeDto,
        description: 'Outcome (résultat réel) associé à une recommandation ou carrière cible.',
    })
    @ApiStandardCreatedResponse({
        description: 'Outcome enregistré.',
        dataExample: {
            id: 'clx-outcome-id',
            career_id: 24,
            status: 'ENROLLED',
            sector: 'Engineering',
            delay_to_outcome: 90,
        },
    })
    @Throttle({ default: { limit: 20, ttl: 60 } })
    @Post('outcomes')
    createOutcome(@Body() dto: CreateOutcomeDto) {
        return this.analytics.createOutcome(dto);
    }

    @ApiOperation({
        summary: 'Récupérer une synthèse analytics',
        description:
            'Agrège les indicateurs clés (sessions, assessments complétés, top carrières, feedbacks) sur une période.',
    })
    @ApiQuery({
        name: 'from',
        required: false,
        description: 'Date de début ISO 8601.',
        example: '2026-01-01T00:00:00.000Z',
    })
    @ApiQuery({
        name: 'to',
        required: false,
        description: 'Date de fin ISO 8601.',
        example: '2026-04-01T23:59:59.999Z',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        description: 'Nombre maximum de carrières top.',
        example: 10,
    })
    @ApiStandardOkResponse({
        description: 'Synthèse analytics récupérée.',
        dataExample: {
            sessionsTotal: 1432,
            assessmentsCompleted: 987,
            topCareers: [{ careerId: 12, name: 'Ingénieur logiciel', count: 231 }],
            feedbackSummary: { LIKED: 450, DISLIKED: 72 },
        },
    })
    @Roles('ADMIN')
    @Throttle({ default: { limit: 20, ttl: 60 } })
    @Get('summary')
    getSummary(@Query() dto: AnalyticsSummaryDto) {
        return this.analytics.getSummary(dto);
    }
}
