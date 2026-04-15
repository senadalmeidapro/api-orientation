import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { GetPhase1QuestionsDto, GetPhase2QuestionsDto, GetNextBatchDto } from './dto';
import { ApiStandardErrorResponses, ApiStandardOkResponse } from '../../common/swagger';

@ApiTags('Questions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiStandardErrorResponses({ includeUnauthorized: true, includeNotFound: true })
@Controller('questions')
export class QuestionsController {
    constructor(private readonly service: QuestionsService) {}

    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Get('phase1')
    @ApiOperation({
        summary: 'Récupérer les questions de phase 1',
        description:
            'Retourne les questions phase 1 restantes pour la session/assessment fournis, en tenant compte de la profondeur (`depth`) et des réponses déjà soumises.',
    })
    @ApiQuery({
        name: 'sessionToken',
        required: true,
        description: 'Token de session actif.',
        example: '4ce2f33a-8dfe-4b20-a5f2-9d3d8b6d2dcd',
    })
    @ApiStandardOkResponse({
        description: 'Questions phase 1 récupérées.',
        dataExample: [
            {
                id: 42,
                riasecType: 'R',
                text: 'J’aime construire des objets concrets.',
                short: 'Construire',
                illustrationUrl: null,
                pointsValue: 1,
                displayOrder: 12,
            },
        ],
    })
    getPhase1(@Query() query: GetPhase1QuestionsDto) {
        return this.service.getPhase1Questions(query);
    }

    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Get('phase2')
    @ApiOperation({
        summary: 'Récupérer les questions de phase 2',
        description:
            'Retourne les questions de la section phase 2 demandée (ou section courante), filtrées selon les réponses déjà enregistrées.',
    })
    @ApiQuery({
        name: 'sessionToken',
        required: true,
        description: 'Token de session actif.',
        example: '4ce2f33a-8dfe-4b20-a5f2-9d3d8b6d2dcd',
    })
    @ApiStandardOkResponse({
        description: 'Questions phase 2 récupérées.',
        dataExample: [
            {
                id: 314,
                riasecType: 'I',
                sectionType: 'APTITUDES',
                text: 'Évaluez votre aisance en résolution de problèmes complexes.',
                subtext: '1 = faible, 5 = élevée',
                minValue: 1,
                maxValue: 5,
                valueLabels: ['Faible', 'Moyen', 'Fort'],
                pointsValue: 1,
                displayOrder: 8,
            },
        ],
    })
    getPhase2(@Query() query: GetPhase2QuestionsDto) {
        return this.service.getPhase2Questions(query);
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
    @ApiStandardOkResponse({
        description: 'Lot adaptatif sélectionné.',
        dataExample: [
            {
                id: 42,
                riasecType: 'R',
                text: 'Question text',
                profiles: [
                    { riasecType: 'R', weight: 0.8 },
                    { riasecType: 'I', weight: 0.2 },
                ],
            },
        ],
    })
    getNextBatch(@Query() query: GetNextBatchDto) {
        return this.service.getNextBatchQuestions(query);
    }
}
