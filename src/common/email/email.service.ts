import { Inject, Injectable, Logger } from '@nestjs/common';
import { EMAIL_CONFIG, EMAIL_PROVIDER } from './email.constants';
import type { EmailConfig } from './email.config';
import { EmailSendError, EmailValidationError } from './email.errors';
import type { EmailProvider } from './email.provider';
import {
    EmailAddress,
    EmailAddressInput,
    EmailPayload,
    EmailProviderSendOptions,
    EmailSendResult,
    SendEmailOptions,
    SendEmailPayload,
    SendTemplateEmailPayload,
    TemplateEmailPayload,
} from './email.types';
import {
    ensureEmailAddress,
    ensureRecipientList,
    renderTemplate,
    sanitizeHeaders,
    sanitizeSubject,
    sanitizeTags,
    sanitizeTemplateParams,
} from './email.utils';

/**
 * EmailService provides a high-level API for sending emails
 *
 * Features:
 * - Template-based emails with parameter substitution
 * - Direct HTML/text emails
 * - Validation and sanitization of all inputs
 * - Comprehensive logging
 * - Pre-configured templates (verification, password reset)
 *
 * SOLID Principles:
 * - Single Responsibility: Email sending orchestration
 * - Open/Closed: Extensible via EmailProvider interface
 * - Liskov Substitution: Any EmailProvider implementation works
 * - Interface Segregation: Clean provider interface
 * - Dependency Inversion: Depends on abstractions (EmailProvider)
 */
@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(
        @Inject(EMAIL_PROVIDER) private readonly provider: EmailProvider,
        @Inject(EMAIL_CONFIG) private readonly config: EmailConfig,
    ) {}

    /**
     * Send a standard email with HTML or text content
     *
     * @param payload - Email content and recipients
     * @param options - Optional configuration (from, cc, bcc, retry, etc.)
     * @returns Result with provider name and message ID
     *
     * @example
     * ```typescript
     * await emailService.sendEmail({
     *   to: 'user@example.com',
     *   subject: 'Welcome!',
     *   html: '<h1>Welcome to our platform</h1>',
     *   text: 'Welcome to our platform'
     * });
     * ```
     */
    async sendEmail(
        payload: SendEmailPayload,
        options?: SendEmailOptions,
    ): Promise<EmailSendResult> {
        const startTime = Date.now();

        try {
            // Validate and sanitize payload
            const emailPayload = this.buildEmailPayload(payload, options);

            // Build provider options
            const providerOptions = this.buildProviderOptions(options);

            // Send email through provider
            const result = await this.provider.sendEmail(emailPayload, providerOptions);

            const duration = Date.now() - startTime;
            const recipients = Array.isArray(payload.to)
                ? payload.to.map((r) => (typeof r === 'string' ? r : r.email)).join(', ')
                : typeof payload.to === 'string'
                  ? payload.to
                  : payload.to.email;
            this.logger.log(`Email sent to ${recipients} in ${duration}ms via ${result.provider}`);

            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            const recipients = Array.isArray(payload.to)
                ? payload.to.map((r) => (typeof r === 'string' ? r : r.email)).join(', ')
                : typeof payload.to === 'string'
                  ? payload.to
                  : payload.to.email;
            this.logger.error(
                `Failed to send email to ${recipients} after ${duration}ms: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    /**
     * Send an email using a pre-configured template
     *
     * @param payload - Template ID, recipients, and parameters
     * @param options - Optional configuration (from, cc, bcc, retry, etc.)
     * @returns Result with provider name and message ID
     *
     * @example
     * ```typescript
     * await emailService.sendTemplateEmail({
     *   to: 'user@example.com',
     *   templateId: 1,
     *   params: { firstName: 'John', verificationUrl: 'https://...' }
     * });
     * ```
     */
    async sendTemplateEmail(
        payload: SendTemplateEmailPayload,
        options?: SendEmailOptions,
    ): Promise<EmailSendResult> {
        const startTime = Date.now();

        try {
            // Validate and sanitize payload
            const templatePayload = this.buildTemplateEmailPayload(payload, options);

            // Build provider options
            const providerOptions = this.buildProviderOptions(options);

            // Send email through provider
            const result = await this.provider.sendTemplateEmail(templatePayload, providerOptions);

            const duration = Date.now() - startTime;
            const recipients = Array.isArray(payload.to)
                ? payload.to.map((r) => (typeof r === 'string' ? r : r.email)).join(', ')
                : typeof payload.to === 'string'
                  ? payload.to
                  : payload.to.email;
            this.logger.log(
                `Template email (ID: ${payload.templateId}) sent to ${recipients} in ${duration}ms via ${result.provider}`,
            );

            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            const recipients = Array.isArray(payload.to)
                ? payload.to.map((r) => (typeof r === 'string' ? r : r.email)).join(', ')
                : typeof payload.to === 'string'
                  ? payload.to
                  : payload.to.email;
            this.logger.error(
                `Failed to send template email to ${recipients} after ${duration}ms: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    /**
     * Send verification email using configured template
     *
     * @param data - Recipient info and verification token
     * @returns Result with provider name and message ID
     */
    async sendVerificationEmail(data: {
        to: string;
        firstName?: string | null;
        token: string;
        userId: string;
    }): Promise<EmailSendResult> {
        // #region agent log
        void fetch('http://127.0.0.1:7242/ingest/acdc9a68-6d41-41ca-9274-181ae653d00d', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                runId: 'initial-debug',
                hypothesisId: 'H3',
                location: 'src/common/email/email.service.ts:177',
                message: 'sendVerificationEmail template config check',
                data: {
                    hasVerificationTemplate: Boolean(this.config.templates.verificationId),
                    hasFrontendUrlEnv: Boolean(process.env.FRONTEND_URL),
                },
                timestamp: Date.now(),
            }),
        }).catch(() => {});
        // #endregion
        if (!this.config.templates.verificationId) {
            throw new EmailSendError('Verification email template not configured', {
                code: 'template_not_configured',
            });
        }

        const verificationUrl = this.buildVerificationUrl(data.token, data.userId);

        return this.sendTemplateEmail({
            to: data.to,
            templateId: this.config.templates.verificationId,
            params: {
                firstName: data.firstName ?? 'User',
                verificationUrl,
                token: data.token,
            },
        });
    }

    /**
     * Send password reset email using configured template
     *
     * @param data - Recipient info and reset token
     * @returns Result with provider name and message ID
     */
    async sendPasswordResetEmail(data: {
        to: string;
        firstName?: string | null;
        token: string;
        userId: string;
    }): Promise<EmailSendResult> {
        if (!this.config.templates.passwordResetId) {
            throw new EmailSendError('Password reset email template not configured', {
                code: 'template_not_configured',
            });
        }

        const resetUrl = this.buildPasswordResetUrl(data.token, data.userId);

        return this.sendTemplateEmail({
            to: data.to,
            templateId: this.config.templates.passwordResetId,
            params: {
                firstName: data.firstName ?? 'User',
                resetUrl,
                token: data.token,
            },
        });
    }

    /**
     * Send email using an HTML template string with parameter substitution
     *
     * @param payload - Email content with template and parameters
     * @param options - Optional configuration
     * @returns Result with provider name and message ID
     *
     * @example
     * ```typescript
     * await emailService.sendEmailFromTemplate({
     *   to: 'user@example.com',
     *   subject: 'Welcome {{firstName}}!',
     *   htmlTemplate: '<h1>Hello {{firstName}}</h1>',
     *   textTemplate: 'Hello {{firstName}}',
     *   params: { firstName: 'John' }
     * });
     * ```
     */
    async sendEmailFromTemplate(
        payload: {
            to: string | string[];
            subject: string;
            htmlTemplate?: string;
            textTemplate?: string;
            params: Record<string, string | number | boolean>;
        },
        options?: SendEmailOptions,
    ): Promise<EmailSendResult> {
        const escapeHtml = !options?.allowUnsafeHtml;

        const html = payload.htmlTemplate
            ? renderTemplate(payload.htmlTemplate, payload.params, { escapeHtml })
            : undefined;

        const text = payload.textTemplate
            ? renderTemplate(payload.textTemplate, payload.params, { escapeHtml: false })
            : undefined;

        const subject = renderTemplate(payload.subject, payload.params, { escapeHtml: false });

        return this.sendEmail(
            {
                to: payload.to,
                subject,
                html,
                text,
            },
            options,
        );
    }

    /**
     * Build and validate email payload
     */
    private buildEmailPayload(payload: SendEmailPayload, options?: SendEmailOptions): EmailPayload {
        const to = ensureRecipientList(payload.to, 'to');
        const from = this.resolveFromAddress(options?.from);
        const subject = sanitizeSubject(payload.subject);

        if (!payload.html && !payload.text) {
            throw new EmailValidationError('Either html or text content is required', 'content');
        }

        const emailPayload: EmailPayload = {
            to,
            from,
            subject,
            html: payload.html,
            text: payload.text,
        };

        if (options?.replyTo) {
            emailPayload.replyTo = ensureEmailAddress(options.replyTo, 'replyTo');
        }
        if (options?.cc) {
            emailPayload.cc = ensureRecipientList(options.cc, 'cc');
        }
        if (options?.bcc) {
            emailPayload.bcc = ensureRecipientList(options.bcc, 'bcc');
        }
        if (options?.headers) {
            emailPayload.headers = sanitizeHeaders(options.headers);
        }
        if (options?.tags) {
            emailPayload.tags = sanitizeTags(options.tags);
        }

        return emailPayload;
    }

    /**
     * Build and validate template email payload
     */
    private buildTemplateEmailPayload(
        payload: SendTemplateEmailPayload,
        options?: SendEmailOptions,
    ): TemplateEmailPayload {
        const to = ensureRecipientList(payload.to, 'to');
        const from = this.resolveFromAddress(options?.from);

        if (!Number.isInteger(payload.templateId) || payload.templateId <= 0) {
            throw new EmailValidationError('Invalid template ID', 'templateId');
        }

        const templatePayload: TemplateEmailPayload = {
            to,
            from,
            templateId: payload.templateId,
        };

        if (payload.params) {
            templatePayload.params = sanitizeTemplateParams(payload.params, {
                escapeHtml: !options?.allowUnsafeHtml,
            });
        }

        if (options?.replyTo) {
            templatePayload.replyTo = ensureEmailAddress(options.replyTo, 'replyTo');
        }
        if (options?.cc) {
            templatePayload.cc = ensureRecipientList(options.cc, 'cc');
        }
        if (options?.bcc) {
            templatePayload.bcc = ensureRecipientList(options.bcc, 'bcc');
        }
        if (options?.headers) {
            templatePayload.headers = sanitizeHeaders(options.headers);
        }
        if (options?.tags) {
            templatePayload.tags = sanitizeTags(options.tags);
        }

        return templatePayload;
    }

    /**
     * Build provider-specific options
     */
    private buildProviderOptions(options?: SendEmailOptions): EmailProviderSendOptions {
        const providerOptions: EmailProviderSendOptions = {};

        if (options?.timeoutMs) {
            providerOptions.timeoutMs = options.timeoutMs;
        }
        if (options?.retry) {
            providerOptions.retry = options.retry;
        }

        // #region agent log
        void fetch('http://127.0.0.1:7242/ingest/acdc9a68-6d41-41ca-9274-181ae653d00d', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                runId: 'initial-debug',
                hypothesisId: 'H1',
                location: 'src/common/email/email.service.ts:375',
                message: 'buildProviderOptions result',
                data: {
                    timeoutMs: providerOptions.timeoutMs ?? null,
                    retryMaxAttempts: providerOptions.retry?.maxAttempts ?? null,
                },
                timestamp: Date.now(),
            }),
        }).catch(() => {});
        // #endregion

        return providerOptions;
    }

    /**
     * Resolve from address (use provided or default)
     */
    private resolveFromAddress(from?: EmailAddressInput): EmailAddress {
        if (!from) {
            return {
                email: this.config.defaultFromEmail,
                name: this.config.defaultFromName,
            };
        }

        return ensureEmailAddress(from, 'from');
    }

    /**
     * Build verification URL (customize based on your frontend)
     */
    private buildVerificationUrl(token: string, userId: string): string {
        const baseUrl = this.config.frontendUrl;
        // #region agent log
        void fetch('http://127.0.0.1:7242/ingest/acdc9a68-6d41-41ca-9274-181ae653d00d', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                runId: 'post-fix',
                hypothesisId: 'H3',
                location: 'src/common/email/email.service.ts:399',
                message: 'buildVerificationUrl base URL decision',
                data: { usesConfiguredFrontendUrl: Boolean(this.config.frontendUrl), baseUrl },
                timestamp: Date.now(),
            }),
        }).catch(() => {});
        // #endregion
        return `${baseUrl}/verify-email?token=${encodeURIComponent(token)}&userId=${encodeURIComponent(userId)}`;
    }

    /**
     * Build password reset URL (customize based on your frontend)
     */
    private buildPasswordResetUrl(token: string, userId: string): string {
        const baseUrl = this.config.frontendUrl;
        return `${baseUrl}/reset-password?token=${encodeURIComponent(token)}&userId=${encodeURIComponent(userId)}`;
    }
}
