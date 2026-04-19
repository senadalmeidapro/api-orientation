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

/* =====================================================
 * INTERFACES
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
    context?: Record<string, any>;
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
export class EmailService implements OnModuleInit {
    private readonly logger = new Logger(EmailService.name);
    private transporter?: nodemailer.Transporter;
    private readonly templates: Map<string, EmailTemplate> = new Map();
    private readonly templateSubjects: Map<string, string> = new Map();
    private readonly templatesPath: string;
    private readonly brevoClient: SibApiV3Sdk.TransactionalEmailsApi;
    private readonly isProduction: boolean;

    constructor(private readonly config: ConfigService) {
        this.isProduction = this.config.engine.nodeEnv === 'production';

        this.templatesPath = path.isAbsolute(this.config.email.templatePath)
            ? this.config.email.templatePath
            : path.join(process.cwd(), this.config.email.templatePath);

        const client = SibApiV3Sdk.ApiClient.instance;
        client.authentications['api-key'].apiKey = config.email.apiKey;
        this.brevoClient = new SibApiV3Sdk.TransactionalEmailsApi();

        if (!this.isProduction) {
            this.transporter = this.createTransporter();
        }
    }

    /* =====================================================
     * LIFECYCLE
     * ===================================================== */

    async onModuleInit(): Promise<void> {
        this.loadSubjects();
        this.loadTemplates();

        if (!this.isProduction) {
            await this.verifyTransporter();
        }
    }

    /* =====================================================
     * PUBLIC METHODS
     * ===================================================== */

    async sendEmail(
        options: MailSendOptions & { tenantId?: string },
    ): Promise<SentMessageInfo | any> {
        const html = this.resolveTemplate(options);

        const templateSubject = options.template
            ? (this.templates.get(options.template)?.subject ?? '')
            : '';
        const subject = this.resolveSubject(
            options.subject,
            templateSubject,
            options.template ?? '',
        );

        try {
            if (this.isProduction) {
                return await this.sendWithBrevo(options.to, subject, html);
            }
            return await this.sendWithSMTP(options, subject, html);
        } catch (err: any) {
            this.logger.error(`Failed to send email to ${options.to}: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Failed to send email');
        }
    }

    /* =====================================================
     * BREVO (PRODUCTION)
     * ===================================================== */

    private async sendWithBrevo(to: string | string[], subject: string, html: string) {
        const recipients = Array.isArray(to) ? to.map((email) => ({ email })) : [{ email: to }];

        const response = await this.brevoClient.sendTransacEmail({
            sender: { email: this.config.email.from, name: this.config.app.name },
            to: recipients,
            subject,
            htmlContent: html,
        });

        this.logger.log(`Email sent via Brevo, messageId: ${response.messageId}`);
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

        const info = await this.transporter.sendMail({
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

        this.logger.log(`Email sent via SMTP, messageId: ${info.messageId}`);
        return info;
    }

    private createTransporter(): nodemailer.Transporter {
        const port = this.config.email.port;
        const secure = port === 465;

        return nodemailer.createTransport({
            host: this.config.email.host,
            port,
            secure,
            auth: {
                user: this.config.email.user,
                pass: this.config.email.password,
            },
            requireTLS: !secure,
            connectionTimeout: 15_000,
            greetingTimeout: 15_000,
            socketTimeout: 30_000,
            pool: true,
            maxConnections: 3,
        });
    }

    private async verifyTransporter(): Promise<void> {
        try {
            await this.transporter?.verify();
            this.logger.log('SMTP transporter ready ✓');
        } catch (err: any) {
            this.logger.error(`SMTP connection failed: ${err.message}`);
        }
    }

    /* =====================================================
     * TEMPLATE SYSTEM
     * ===================================================== */

    private resolveTemplate(options: MailSendOptions): string {
        if (!options.template) return options.html ?? '';

        const template = this.templates.get(options.template);
        if (!template) {
            throw new BadRequestException(`Template "${options.template}" not found`);
        }

        return handlebars.compile(template.html)(options.context ?? {});
    }

    private loadTemplates(): void {
        if (!fs.existsSync(this.templatesPath)) {
            this.logger.error(`Templates directory not found: ${this.templatesPath}`);
            return;
        }

        const files = fs.readdirSync(this.templatesPath);
        let count = 0;

        files.forEach((file) => {
            if (file.endsWith('.hbs')) {
                const content = fs.readFileSync(path.join(this.templatesPath, file), 'utf-8');
                const name = file.replace('.hbs', '');
                this.templates.set(name, {
                    subject: this.templateSubjects.get(name) ?? '',
                    html: content,
                });
                count++;
            }
        });

        this.logger.log(`Loaded ${count} email template(s)`);
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
     * BUSINESS METHODS
     * ===================================================== */

    async sendWelcomeEmail(recipient: MailRecipient, verificationLink?: string) {
        return this.sendEmail({
            to: recipient.email,
            subject: recipient.subject,
            template: 'welcome',
            context: this.buildTemplateData(recipient, { verificationLink }),
            tenantId: recipient.tenantId,
        });
    }

    async sendVerificationEmail(
        recipient: MailRecipient,
        verificationLink: string,
        expiresIn = '24 hours',
    ) {
        return this.sendEmail({
            to: recipient.email,
            subject: recipient.subject,
            template: 'email-verification',
            context: this.buildTemplateData(recipient, { verificationLink, expiresIn }),
            tenantId: recipient.tenantId,
        });
    }

    async sendPasswordResetEmail(
        recipient: MailRecipient,
        resetLink: string,
        expiresIn = '1 hour',
    ) {
        return this.sendEmail({
            to: recipient.email,
            subject: recipient.subject,
            template: 'password-reset',
            context: this.buildTemplateData(recipient, {
                resetLink,
                expiresIn,
                ipAddress: recipient.metadata?.ipAddress,
            }),
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
                `${recipient.firstName ?? ''} ${recipient.lastName ?? ''}`.trim(),
            email: recipient.email,
            appName: this.config.app.name,
            supportEmail: this.config.app.supportEmail,
            currentYear: new Date().getFullYear(),
            ...extra,
        };
    }
}
