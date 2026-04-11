import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmailService } from '../../common/email/email.service';
import {
    EmailSendResultDto,
    SendEmailDto,
    SendEmailOptionsDto,
    SendTemplateEmailDto,
} from '../../common/email/dto/send-email.dto';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt.guard';

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
@Controller('email')
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
    @ApiOperation({ summary: 'Send a standard email' })
    @ApiResponse({ status: 201, description: 'Email sent successfully', type: EmailSendResultDto })
    @ApiResponse({ status: 400, description: 'Invalid request' })
    async sendEmail(
        @Body() payload: SendEmailDto,
        @Body() options?: SendEmailOptionsDto,
    ): Promise<EmailSendResultDto> {
        return this.emailService.sendEmail(payload, options);
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
    @ApiOperation({ summary: 'Send a template email' })
    @ApiResponse({ status: 201, description: 'Email sent successfully', type: EmailSendResultDto })
    @ApiResponse({ status: 400, description: 'Invalid request' })
    async sendTemplateEmail(
        @Body() payload: SendTemplateEmailDto,
        @Body() options?: SendEmailOptionsDto,
    ): Promise<EmailSendResultDto> {
        return this.emailService.sendTemplateEmail(payload, options);
    }
}
