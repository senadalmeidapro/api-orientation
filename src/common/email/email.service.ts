import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    OnModuleInit,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import SibApiV3Sdk from 'sib-api-v3-sdk';
import { ConfigService } from '../config/config.service';

/* ─────────────────────────────────────────
 * INTERFACES
 * ───────────────────────────────────────── */

export interface MailAttachment {
    filename: string;
    path?: string;
    content?: Buffer | string;
    contentType?: string;
    encoding?: string;
}

export interface MailRecipient<T = any> {
    email: string;
    subject: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    metadata?: T;
    tenantId?: string;
}

export interface MailSendOptions {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    template?: string;
    context?: Record<string, any>;
    from?: string;
    replyTo?: string;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: MailAttachment[];
    headers?: Record<string, string>;
    priority?: 'high' | 'normal' | 'low';
    tenantId?: string;
}

interface EmailTemplate {
    subject: string;
    html: string;
    text?: string;
}

/* ─────────────────────────────────────────
 * SERVICE
 * ───────────────────────────────────────── */

@Injectable()
export class EmailService implements OnModuleInit {
    private readonly logger = new Logger(EmailService.name);
    private transporter?: nodemailer.Transporter;
    private readonly templates = new Map<string, EmailTemplate>();
    private readonly templateSubjects = new Map<string, string>();
    private readonly templatesPath: string;
    private readonly brevoClient: SibApiV3Sdk.TransactionalEmailsApi;
    private readonly isProduction: boolean;

    constructor(private readonly config: ConfigService) {
        this.isProduction = this.config.engine.nodeEnv === 'production';

        this.logger.log(`[INIT] EmailService starting | env=${this.config.engine.nodeEnv}`);

        this.templatesPath = path.isAbsolute(this.config.email.templatePath)
            ? this.config.email.templatePath
            : path.join(process.cwd(), this.config.email.templatePath);

        const client = SibApiV3Sdk.ApiClient.instance;
        client.authentications['api-key'].apiKey = this.config.email.brevo.apiKey;

        this.logger.log(`[INIT] Brevo API key loaded (masked)`);

        this.brevoClient = new SibApiV3Sdk.TransactionalEmailsApi();

        if (!this.isProduction) {
            this.logger.log(`[INIT] SMTP mode enabled (non-production)`);
            this.transporter = this.createSmtpTransporter();
        } else {
            this.logger.log(`[INIT] Production mode → Brevo API enabled`);
        }
    }

    async onModuleInit(): Promise<void> {
        this.logger.log(`[LIFECYCLE] onModuleInit started`);

        this.loadSubjects();
        this.loadTemplates();

        if (!this.isProduction) {
            await this.verifySmtpTransporter();
        }

        this.logger.log(`[LIFECYCLE] onModuleInit completed`);
    }

    /* ─────────────────────────────────────────
     * PUBLIC
     * ───────────────────────────────────────── */

    async sendEmail(options: MailSendOptions): Promise<SentMessageInfo | any> {
        const requestId = `mail_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

        this.logger.log(`[EMAIL][${requestId}] ▶ Incoming sendEmail`);
        this.logger.debug(
            `[EMAIL][${requestId}] Options: ${JSON.stringify({
                ...options,
                html: options.html ? '[HTML_REMOVED]' : undefined,
            })}`,
        );

        const html = this.resolveTemplate(options);
        const subject = this.resolveSubject(
            options.subject,
            options.template ? (this.templates.get(options.template)?.subject ?? '') : '',
            options.template ?? '',
        );

        this.logger.log(`[EMAIL][${requestId}] Subject resolved: ${subject}`);

        try {
            const result = this.isProduction
                ? await this.sendWithBrevo(options.to, subject, html, requestId)
                : await this.sendWithSmtp(options, subject, html, requestId);

            this.logger.log(`[EMAIL][${requestId}] ✔ Completed successfully`);
            return result;
        } catch (err: any) {
            this.logger.error(`[EMAIL][${requestId}] ✖ Failed: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Failed to send email');
        }
    }

    /* ─────────────────────────────────────────
     * BREVO
     * ───────────────────────────────────────── */

    private async sendWithBrevo(
        to: string | string[],
        subject: string,
        html: string,
        requestId: string,
    ) {
        const recipients = Array.isArray(to) ? to.map((email) => ({ email })) : [{ email: to }];

        const payload = {
            sender: {
                email: this.config.email.fromAddress,
                name: this.config.email.fromName,
            },
            to: recipients,
            subject,
            htmlContent: html,
        };

        const start = Date.now();

        this.logger.log(`[BREVO][${requestId}] ▶ Sending request`);
        this.logger.debug(
            `[BREVO][${requestId}] Payload: ${JSON.stringify({
                ...payload,
                htmlContent: '[HIDDEN]',
            })}`,
        );

        try {
            const response = await this.brevoClient.sendTransacEmail(payload);

            const duration = Date.now() - start;

            this.logger.log(
                `[BREVO][${requestId}] ✔ Success | ${duration}ms | messageId=${response.messageId}`,
            );

            this.logger.debug(`[BREVO][${requestId}] Response body: ${JSON.stringify(response)}`);

            return response;
        } catch (error: any) {
            const duration = Date.now() - start;

            this.logger.error(`[BREVO][${requestId}] ✖ Failed | ${duration}ms`);

            if (error.response) {
                this.logger.error(`[BREVO][${requestId}] HTTP Status: ${error.response.status}`);

                this.logger.error(
                    `[BREVO][${requestId}] Response Body: ${JSON.stringify(error.response.body)}`,
                );

                this.logger.error(
                    `[BREVO][${requestId}] Headers: ${JSON.stringify(error.response.headers)}`,
                );
            }

            this.logger.error(`[BREVO][${requestId}] Message: ${error.message}`);

            throw error;
        }
    }

    /* ─────────────────────────────────────────
     * SMTP
     * ───────────────────────────────────────── */

    private async sendWithSmtp(
        options: MailSendOptions,
        subject: string,
        html: string,
        requestId: string,
    ): Promise<SentMessageInfo> {
        this.logger.log(`[SMTP][${requestId}] ▶ Sending`);

        const info = await this.transporter!.sendMail({
            from: options.from ?? this.config.email.from,
            to: options.to,
            subject,
            html,
            text: options.text,
            cc: options.cc,
            bcc: options.bcc,
            attachments: options.attachments,
            headers: options.headers,
            priority: options.priority,
        });

        this.logger.log(`[SMTP][${requestId}] ✔ Sent | messageId=${info.messageId}`);

        return info;
    }

    private createSmtpTransporter(): nodemailer.Transporter {
        const port = this.config.email.port;
        const secure = port === 465;

        this.logger.log(`[SMTP] Creating transporter | host=${this.config.email.host}`);

        return nodemailer.createTransport({
            host: this.config.email.host,
            port,
            secure,
            auth: {
                user: this.config.email.user,
                pass: this.config.email.password,
            },
            requireTLS: !secure,
            connectionTimeout: this.config.email.connectionTimeout,
            greetingTimeout: this.config.email.greetingTimeout,
            socketTimeout: this.config.email.socketTimeout,
            pool: true,
            maxConnections: 3,
        });
    }

    private async verifySmtpTransporter(): Promise<void> {
        try {
            await this.transporter?.verify();
            this.logger.log(`[SMTP] ✔ Connection verified`);
        } catch (err: any) {
            this.logger.error(`[SMTP] ✖ Connection failed: ${err.message}`);
        }
    }

    /* ─────────────────────────────────────────
     * TEMPLATES
     * ───────────────────────────────────────── */

    private resolveTemplate(options: MailSendOptions): string {
        if (!options.template) return options.html ?? '';

        const template = this.templates.get(options.template);
        if (!template) {
            throw new BadRequestException(`Template "${options.template}" introuvable`);
        }

        return handlebars.compile(template.html)(options.context ?? {});
    }

    private loadTemplates(): void {
        if (!fs.existsSync(this.templatesPath)) {
            this.logger.error(`[TEMPLATES] Folder not found: ${this.templatesPath}`);
            return;
        }

        let count = 0;

        fs.readdirSync(this.templatesPath)
            .filter((f) => f.endsWith('.hbs'))
            .forEach((file) => {
                const name = file.replace('.hbs', '');
                const content = fs.readFileSync(path.join(this.templatesPath, file), 'utf-8');

                this.templates.set(name, {
                    subject: this.templateSubjects.get(name) ?? '',
                    html: content,
                });

                count++;
            });

        this.logger.log(`[TEMPLATES] Loaded ${count} templates`);
    }

    private loadSubjects(): void {
        const file = path.join(this.templatesPath, 'subjects.json');
        if (!fs.existsSync(file)) return;

        const data = JSON.parse(fs.readFileSync(file, 'utf-8')) as Record<string, string>;

        Object.entries(data).forEach(([k, v]) => {
            this.templateSubjects.set(k, v);
        });

        this.logger.log(`[TEMPLATES] Subjects loaded`);
    }

    private resolveSubject(
        explicit: string,
        templateSubject: string,
        templateName: string,
    ): string {
        if (explicit) return explicit;
        if (templateSubject) return templateSubject;
        if (templateName && this.templateSubjects.has(templateName)) {
            return this.templateSubjects.get(templateName)!;
        }
        return this.config.app.name;
    }

    /* ─────────────────────────────────────────
     * BUSINESS
     * ───────────────────────────────────────── */

    async sendWelcomeEmail(recipient: MailRecipient, verificationLink?: string) {
        return this.sendEmail({
            to: recipient.email,
            subject: recipient.subject,
            template: 'welcome',
            context: this.buildContext(recipient, { verificationLink }),
        });
    }

    async sendVerificationEmail(
        recipient: MailRecipient,
        verificationLink: string,
        expiresIn = '24 heures',
    ) {
        return this.sendEmail({
            to: recipient.email,
            subject: recipient.subject,
            template: 'email-verification',
            context: this.buildContext(recipient, { verificationLink, expiresIn }),
        });
    }

    async sendPasswordResetEmail(
        recipient: MailRecipient,
        resetLink: string,
        expiresIn = '1 heure',
    ) {
        return this.sendEmail({
            to: recipient.email,
            subject: recipient.subject,
            template: 'password-reset',
            context: this.buildContext(recipient, {
                resetLink,
                expiresIn,
                ipAddress: recipient.metadata?.ipAddress,
            }),
        });
    }

    private buildContext(
        recipient: MailRecipient,
        extra: Record<string, any> = {},
    ): Record<string, any> {
        return {
            firstName: recipient.firstName,
            lastName: recipient.lastName,
            fullName:
                recipient.fullName ??
                `${recipient.firstName ?? ''} ${recipient.lastName ?? ''}`.trim(),
            email: recipient.email,
            appName: this.config.app.name,
            supportEmail: this.config.app.supportEmail,
            privacyPolicyUrl: `${this.config.app.frontendUrl}/privacy-policy`,
            contactUrl: `${this.config.app.frontendUrl}/contact`,
            currentYear: new Date().getFullYear(),
            ...extra,
        };
    }
}
