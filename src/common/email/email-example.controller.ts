import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EmailService } from '../../common/email/email.service';
import { EmailSendResultDto } from '../../common/email/dto/send-email.dto';
import {
    SendEmailRequestDto,
    SendTemplateEmailRequestDto,
} from '../../common/email/dto/send-email-request.dto';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt.guard';
import { ApiStandardCreatedResponse, ApiStandardErrorResponses } from '../swagger';

/**
 * Example Email Controller
 *
 * This is a reference implementation showing how to expose email endpoints.
 * In production, you might want to:
 * - Add authentication/authorization
 * - Rate limit these endpoints
 * - Queue emails instead of sending synchronously
 * - Restrict to admin users only
 */
@ApiTags('Email (Example)')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiStandardErrorResponses({ includeUnauthorized: true })
@Controller('api/v1/email')
export class EmailExampleController {
    constructor(private readonly emailService: EmailService) {}

    /**
     * Send a standard email
     *
     * Example request:
     * POST /email/send
     * {
     *   "to": "user@example.com",
     *   "subject": "Hello",
     *   "html": "<p>Hello World</p>",
     *   "text": "Hello World"
     * }
     */
    @Post('send')
    @ApiOperation({
        summary: 'Envoyer un email standard',
        description:
            'Endpoint exemple pour envoyer un email direct avec contenu texte/HTML et options de transport.',
    })
    @ApiBody({
        type: SendEmailRequestDto,
        description: 'Objet contenant `payload` et `options`.',
    })
    @ApiStandardCreatedResponse({
        description: 'Email envoyé avec succès.',
        model: EmailSendResultDto,
        message: 'Email envoyé avec succès.',
    })
    async sendEmail(@Body() request: SendEmailRequestDto): Promise<EmailSendResultDto> {
        return this.emailService.sendEmail(request.payload, request.options);
    }

    /**
     * Send a template email
     *
     * Example request:
     * POST /email/send-template
     * {
     *   "to": "user@example.com",
     *   "templateId": 1,
     *   "params": {
     *     "firstName": "John",
     *     "verificationUrl": "https://example.com/verify"
     *   }
     * }
     */
    @Post('send-template')
    @ApiOperation({
        summary: 'Envoyer un email template',
        description:
            'Endpoint exemple pour envoyer un email basé sur un template fournisseur (templateId + paramètres).',
    })
    @ApiBody({
        type: SendTemplateEmailRequestDto,
        description: 'Objet contenant `payload` template et `options`.',
    })
    @ApiStandardCreatedResponse({
        description: 'Email template envoyé avec succès.',
        model: EmailSendResultDto,
        message: 'Email template envoyé avec succès.',
    })
    async sendTemplateEmail(
        @Body() request: SendTemplateEmailRequestDto,
    ): Promise<EmailSendResultDto> {
        return this.emailService.sendTemplateEmail(request.payload, request.options);
    }
}
