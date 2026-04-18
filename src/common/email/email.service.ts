import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import SibApiV3Sdk from 'sib-api-v3-sdk';
import { ConfigService } from '../config/config.service';

/* =====================================================
 * INTERFACES (INCHANGÉES)
 * ===================================================== */

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
    templateData?: Record<string, any>;
    from?: string;
    replyTo?: string;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: MailAttachment[];
    headers?: Record<string, string>;
    priority?: 'high' | 'normal' | 'low';
}

export interface MailSendResult {
    email: string;
    success: boolean;
    messageId?: string;
    error?: string;
}

export interface EmailTemplate {
    subject: string;
    html: string;
    text?: string;
}

/* =====================================================
 * SERVICE
 * ===================================================== */

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter?: nodemailer.Transporter;
    private readonly templates: Map<string, EmailTemplate> = new Map();
    private readonly templateSubjects: Map<string, string> = new Map();
    private readonly templatesPath: string;
    private readonly brevoClient: SibApiV3Sdk.TransactionalEmailsApi;

    constructor(private readonly config: ConfigService) {
        this.templatesPath = path.isAbsolute(this.config.email.templatePath)
            ? this.config.email.templatePath
            : path.join(process.cwd(), this.config.email.templatePath);

        // === BREVO API INIT ===
        const client = SibApiV3Sdk.ApiClient.instance;
        client.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
        this.brevoClient = new SibApiV3Sdk.TransactionalEmailsApi();

        // === SMTP seulement en dev ===
        if (this.config.engine.nodeEnv !== 'production') {
            this.transporter = this.createTransporter();
            this.initializeTransporter();
        }

        this.loadSubjects();
        this.loadTemplates();
    }

    /* =====================================================
     * PUBLIC METHODS
     * ===================================================== */

    async sendEmail(
        options: MailSendOptions & { tenantId?: string },
    ): Promise<SentMessageInfo | any> {
        try {
            const subject = this.resolveSubject(options.subject, '', options.template || '');

            const html = this.resolveTemplate(options);

            if (this.config.engine.nodeEnv === 'production') {
                return await this.sendWithBrevo(options.to, subject, html);
            }

            return await this.sendWithSMTP(options, subject, html);
        } catch (err: any) {
            this.logger.error('Failed to send email:', err);
            throw new InternalServerErrorException(err.message);
        }
    }

    /* =====================================================
     * BREVO (PRODUCTION)
     * ===================================================== */

    private async sendWithBrevo(to: string | string[], subject: string, html: string) {
        const recipients = Array.isArray(to) ? to.map((email) => ({ email })) : [{ email: to }];

        const response = await this.brevoClient.sendTransacEmail({
            sender: {
                email: this.config.email.from,
                name: this.config.app.name,
            },
            to: recipients,
            subject,
            htmlContent: html,
        });

        this.logger.debug(`Brevo email sent: ${response.messageId}`);
        return response;
    }

    /* =====================================================
     * SMTP (DEV)
     * ===================================================== */

    private async sendWithSMTP(
        options: MailSendOptions,
        subject: string,
        html: string,
    ): Promise<SentMessageInfo> {
        if (!this.transporter) {
            throw new Error('SMTP transporter not initialized');
        }

        return await this.transporter.sendMail({
            from: options.from || this.config.email.from,
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
    }

    private createTransporter(): nodemailer.Transporter {
        return nodemailer.createTransport({
            host: this.config.email.host,
            port: this.config.email.port,
            secure: this.config.email.port === 465,
            auth: {
                user: this.config.email.user,
                pass: this.config.email.password,
            },
            requireTLS: true,
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
        });
    }

    private async initializeTransporter(): Promise<void> {
        try {
            await this.transporter?.verify();
            this.logger.log('SMTP transporter ready');
        } catch {
            this.logger.warn('SMTP unavailable (ignored)');
        }
    }

    /* =====================================================
     * TEMPLATE SYSTEM
     * ===================================================== */

    private resolveTemplate(options: MailSendOptions): string {
        if (!options.template) return options.html || '';

        const template = this.templates.get(options.template);
        if (!template) {
            throw new BadRequestException(`Template ${options.template} not found`);
        }

        return handlebars.compile(template.html)(options.templateData || {});
    }

    private loadTemplates(): void {
        if (!fs.existsSync(this.templatesPath)) return;

        const files = fs.readdirSync(this.templatesPath);

        files.forEach((file) => {
            if (file.endsWith('.hbs')) {
                const content = fs.readFileSync(path.join(this.templatesPath, file), 'utf-8');

                const name = file.replace('.hbs', '');
                this.templates.set(name, {
                    subject: this.templateSubjects.get(name) || '',
                    html: content,
                });
            }
        });
    }

    private loadSubjects(): void {
        const file = path.join(this.templatesPath, 'subjects.json');
        if (!fs.existsSync(file)) return;

        const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
        Object.entries(data).forEach(([k, v]) => this.templateSubjects.set(k, v as string));
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

    /* =====================================================
     * MÉTHODES MÉTIER (RESTAURÉES)
     * ===================================================== */

    async sendWelcomeEmail(recipient: MailRecipient, verificationLink?: string) {
        const data = this.buildTemplateData(recipient, { verificationLink });

        return this.sendEmail({
            to: recipient.email,
            subject: recipient.subject,
            template: 'welcome',
            templateData: data,
            tenantId: recipient.tenantId,
        });
    }

    async sendVerificationEmail(
        recipient: MailRecipient,
        verificationLink: string,
        expiresIn = '24 hours',
    ) {
        const data = this.buildTemplateData(recipient, {
            verificationLink,
            expiresIn,
        });

        return this.sendEmail({
            to: recipient.email,
            subject: recipient.subject,
            template: 'email-verification',
            templateData: data,
            tenantId: recipient.tenantId,
        });
    }

    async sendPasswordResetEmail(
        recipient: MailRecipient,
        resetLink: string,
        expiresIn = '1 hour',
    ) {
        const data = this.buildTemplateData(recipient, {
            resetLink,
            expiresIn,
            ipAddress: recipient.metadata?.ipAddress,
        });

        return this.sendEmail({
            to: recipient.email,
            subject: recipient.subject,
            template: 'password-reset',
            templateData: data,
            tenantId: recipient.tenantId,
        });
    }
    private buildTemplateData(
        recipient: MailRecipient,
        extra: Record<string, any> = {},
    ): Record<string, any> {
        return {
            firstName: recipient.firstName,
            lastName: recipient.lastName,
            fullName:
                recipient.fullName ||
                `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim(),
            email: recipient.email,
            appName: this.config.app.name,
            supportEmail: this.config.app.supportEmail,
            currentYear: new Date().getFullYear(),
            ...extra,
        };
    }
}
