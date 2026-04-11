import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { GetPhase1QuestionsDto, GetPhase2QuestionsDto, GetNextBatchDto } from './dto';

@ApiTags('Questions')
@UseGuards(JwtAuthGuard)
@Controller('questions')
export class QuestionsController {
    constructor(private readonly service: QuestionsService) {}

    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Get('phase1')
    @ApiOperation({ summary: 'Récupérer les questions Phase 1' })
    @ApiResponse({ status: 200, description: 'Questions Phase 1 récupérées avec succès' })
    getPhase1(@Query() query: GetPhase1QuestionsDto) {
        return this.service.getPhase1Questions(query);
    }

    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Get('phase2')
    @ApiOperation({ summary: 'Récupérer les questions Phase 2' })
    @ApiResponse({ status: 200, description: 'Questions Phase 2 récupérées avec succès' })
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
    @ApiResponse({
        status: 200,
        description: 'Lot de questions sélectionné avec sélection adaptative',
        schema: {
            example: {
                questions: [
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
            },
        },
    })
    @ApiResponse({ status: 404, description: 'Assessment non trouvé' })
    getNextBatch(@Query() query: GetNextBatchDto) {
        return this.service.getNextBatchQuestions(query);
    }
}
