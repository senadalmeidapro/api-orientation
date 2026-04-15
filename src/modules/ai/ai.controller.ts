import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { AiChatDto, AiCoachDto, AiSummaryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Public } from '../../common/decorators';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiStandardCreatedResponse, ApiStandardErrorResponses } from '../../common/swagger';

@ApiTags('Ai')
@Controller('api/v1/ai')
export class AiController {
    constructor(private readonly service: AiService) {}

    @ApiOperation({
        summary: 'Générer un résumé IA du profil',
        description:
            'Produit une synthèse IA du profil d’orientation à partir de la session et du dernier assessment.',
    })
    @ApiBearerAuth('access-token')
    @ApiBody({
        type: AiSummaryDto,
        description:
            'Token de session requis, assessmentId optionnel et limite de recommandations.',
    })
    @ApiStandardCreatedResponse({
        description: 'Résumé IA généré.',
        dataExample: {
            summary: 'Vous présentez un profil RIASEC orienté Réaliste-Investigatif.',
            recommendations: [
                {
                    name: 'Ingénierie industrielle',
                    rationale: 'Forte adéquation avec vos scores R et I.',
                },
            ],
            nextSteps: ['Explorer 3 parcours techniques', 'Planifier un stage découverte'],
        },
    })
    @ApiStandardErrorResponses({ includeUnauthorized: true, includeNotFound: true })
    @Throttle({ default: { limit: 10, ttl: 60 } })
    @UseGuards(JwtAuthGuard)
    @Post('summary')
    summary(@Body() dto: AiSummaryDto) {
        return this.service.summary(dto);
    }

    @ApiOperation({
        summary: 'Coaching IA pour questions suivantes',
        description:
            'Sélectionne des questions suivantes et fournit un message de coaching contextualisé.',
    })
    @ApiBearerAuth('access-token')
    @ApiBody({
        type: AiCoachDto,
        description:
            'Token de session, assessmentId optionnel, section éventuelle, maxQuestions et message utilisateur.',
    })
    @ApiStandardCreatedResponse({
        description: 'Suggestion de coaching générée.',
        dataExample: {
            profileGuess: { topCodes: ['R', 'I', 'S'], confidence: 0.79 },
            nextQuestionIds: [45, 81, 94],
            nextQuestions: [{ id: 45, text: 'Je préfère résoudre des problèmes techniques.' }],
            message: 'Tes réponses indiquent un bon potentiel analytique.',
            rationale: 'Les prochaines questions vont différencier I et R.',
        },
    })
    @ApiStandardErrorResponses({ includeUnauthorized: true, includeNotFound: true })
    @Throttle({ default: { limit: 10, ttl: 60 } })
    @UseGuards(JwtAuthGuard)
    @Post('coach')
    coach(@Body() dto: AiCoachDto) {
        return this.service.coach(dto);
    }

    @ApiOperation({
        summary: 'Chat IA contextuel',
        description:
            'Conversation IA en langage naturel, contextualisée par la session et la progression d’assessment.',
    })
    @ApiBody({
        type: AiChatDto,
        description: 'Token de session, message utilisateur et assessmentId optionnel.',
    })
    @ApiStandardCreatedResponse({
        description: 'Réponse conversationnelle générée.',
        dataExample: {
            reply: 'Tu sembles progresser vers un profil investigatif. Souhaites-tu explorer des métiers scientifiques ?',
        },
    })
    @ApiStandardErrorResponses({ includeNotFound: true })
    @Throttle({ default: { limit: 10, ttl: 60 } })
    @Public()
    @Post('chat')
    chat(@Body() dto: AiChatDto) {
        return this.service.chat(dto);
    }
}
