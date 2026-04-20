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

        this.templatesPath = path.isAbsolute(this.config.email.templatePath)
            ? this.config.email.templatePath
            : path.join(process.cwd(), this.config.email.templatePath);

        const client = SibApiV3Sdk.ApiClient.instance;
        client.authentications['api-key'].apiKey = this.config.email.brevo.apiKey;

        this.brevoClient = new SibApiV3Sdk.TransactionalEmailsApi();

        if (!this.isProduction) {
            this.transporter = this.createSmtpTransporter();
        }
    }

    async onModuleInit(): Promise<void> {
        this.loadSubjects();
        this.loadTemplates();

        if (!this.isProduction) {
            await this.verifySmtpTransporter();
        }
    }

    /* ─────────────────────────────────────────
     * PUBLIC
     * ───────────────────────────────────────── */

    async sendEmail(options: MailSendOptions): Promise<SentMessageInfo | any> {
        const html = this.resolveTemplate(options);
        const subject = this.resolveSubject(
            options.subject,
            options.template ? (this.templates.get(options.template)?.subject ?? '') : '',
            options.template ?? '',
        );

        try {
            return this.isProduction
                ? await this.sendWithBrevo(options.to, subject, html)
                : await this.sendWithSmtp(options, subject, html);
        } catch (err: any) {
            this.logger.error(`Failed to send email: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Failed to send email');
        }
    }

    /* ─────────────────────────────────────────
     * BREVO
     * ───────────────────────────────────────── */

    private async sendWithBrevo(to: string | string[], subject: string, html: string) {
        const recipients = Array.isArray(to) ? to.map((email) => ({ email })) : [{ email: to }];

        return await this.brevoClient.sendTransacEmail({
            sender: {
                email: this.config.email.fromAddress,
                name: this.config.email.fromName,
            },
            to: recipients,
            subject,
            htmlContent: html,
        });
    }

    /* ─────────────────────────────────────────
     * SMTP
     * ───────────────────────────────────────── */

    private async sendWithSmtp(
        options: MailSendOptions,
        subject: string,
        html: string,
    ): Promise<SentMessageInfo> {
        if (!this.transporter) {
            throw new Error('SMTP transporter non initialisé');
        }

        return await this.transporter.sendMail({
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
    }

    private createSmtpTransporter(): nodemailer.Transporter {
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
        } catch (err: any) {
            this.logger.error(`SMTP connection failed: ${err.message}`);
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
            this.logger.error(`Templates folder not found: ${this.templatesPath}`);
            return;
        }

        fs.readdirSync(this.templatesPath)
            .filter((f) => f.endsWith('.hbs'))
            .forEach((file) => {
                const name = file.replace('.hbs', '');
                const content = fs.readFileSync(path.join(this.templatesPath, file), 'utf-8');

                this.templates.set(name, {
                    subject: this.templateSubjects.get(name) ?? '',
                    html: content,
                });
            });
    }

    private loadSubjects(): void {
        const file = path.join(this.templatesPath, 'subjects.json');
        if (!fs.existsSync(file)) return;

        const data = JSON.parse(fs.readFileSync(file, 'utf-8')) as Record<string, string>;

        Object.entries(data).forEach(([k, v]) => {
            this.templateSubjects.set(k, v);
        });
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
