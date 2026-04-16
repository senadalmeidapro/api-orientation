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
import { ConfigService } from '../config/config.service';

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

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly transporter: nodemailer.Transporter;
    private readonly templates: Map<string, EmailTemplate> = new Map();
    private readonly templateSubjects: Map<string, string> = new Map();
    private readonly templatesPath: string;

    constructor(private readonly config: ConfigService) {
        this.templatesPath = path.isAbsolute(this.config.email.templatePath)
            ? this.config.email.templatePath
            : path.join(process.cwd(), this.config.email.templatePath);
        this.transporter = this.createTransporter();
        this.initializeTransporter();
        this.loadSubjects();
        this.loadTemplates();
    }

    getTemplate(templateName: string): EmailTemplate {
        const template = this.templates.get(templateName);
        if (!template) throw new BadRequestException(`Email template "${templateName}" not found`);
        return template;
    }

    async sendEmail(options: MailSendOptions & { tenantId?: string }): Promise<SentMessageInfo> {
        try {
            const mailOptions: nodemailer.SendMailOptions = {
                from: options.from || this.config.email.from,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
                replyTo: options.replyTo,
                cc: options.cc,
                bcc: options.bcc,
                attachments: options.attachments,
                headers: options.headers,
                priority: options.priority,
            };

            if (options.template) {
                const template = this.getTemplate(options.template);
                mailOptions.subject = this.resolveSubject(
                    options.subject,
                    template.subject,
                    options.template,
                );
                mailOptions.html = template.html
                    ? this.compileTemplate(template.html, options.templateData || {})
                    : options.html;
                mailOptions.text = template.text
                    ? this.compileTemplate(template.text, options.templateData || {})
                    : options.text;
            } else {
                mailOptions.subject = this.resolveSubject(options.subject, '', '');
            }

            const recipientStr = Array.isArray(options.to) ? options.to.join(', ') : options.to;
            this.logger.debug(`Sending email to: ${recipientStr}`);

            const result = await this.transporter.sendMail(mailOptions);
            this.logger.debug(`Email sent successfully: ${result.messageId}`);
            return result;
        } catch (err: any) {
            this.logger.error('Failed to send email:', err);
            throw new InternalServerErrorException(`Failed to send email: ${err.message}`);
        }
    }

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
        const data = this.buildTemplateData(recipient, { verificationLink, expiresIn });
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

    async sendBulkEmails<T>(
        recipients: MailRecipient<T>[],
        templateName: string,
        templateDataMapper?: (recipient: MailRecipient<T>) => Record<string, any>,
        options?: { batchSize?: number; delayBetweenBatches?: number },
    ): Promise<MailSendResult[]> {
        const batchSize = options?.batchSize || 50;
        const delay = options?.delayBetweenBatches || 1000;
        const results: MailSendResult[] = [];

        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map(async (recipient) => {
                    try {
                        const data = templateDataMapper
                            ? templateDataMapper(recipient)
                            : this.buildTemplateData(recipient);
                        const result = await this.sendEmail({
                            to: recipient.email,
                            subject: recipient.subject,
                            template: templateName,
                            templateData: data,
                            tenantId: recipient.tenantId,
                        });
                        return {
                            email: recipient.email,
                            success: true,
                            messageId: result.messageId,
                        };
                    } catch (err: any) {
                        this.logger.error(`Failed to send email to ${recipient.email}:`, err);
                        return { email: recipient.email, success: false, error: err.message };
                    }
                }),
            );
            results.push(...batchResults);
            if (i + batchSize < recipients.length) await new Promise((r) => setTimeout(r, delay));
        }

        return results;
    }

    async testConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            return true;
        } catch (err: any) {
            this.logger.error('Email connection test failed:', err);
            return false;
        }
    }

    async close(): Promise<void> {
        try {
            this.transporter.close();
            this.logger.log('Email transporter closed');
        } catch (err: any) {
            this.logger.error('Failed to close email transporter:', err);
        }
    }

    private createTransporter(): nodemailer.Transporter {
        const emailConfig = {
            host: this.config.email.host,
            port: this.config.email.port,
            secure: this.config.email.secure,
            auth: {
                user: this.config.email.user,
                pass: this.config.email.password,
            },
            tls: { rejectUnauthorized: this.config.email.useTLS },
            connectionTimeout: this.config.email.connectionTimeout,
            greetingTimeout: this.config.email.greetingTimeout,
            socketTimeout: this.config.email.socketTimeout,
        };
        return nodemailer.createTransport(emailConfig);
    }

    private async initializeTransporter(): Promise<void> {
        try {
            await this.transporter.verify();
            this.logger.log('Email transporter configured successfully');
        } catch (error: any) {
            this.logger.error('Failed to configure email transporter:', error);
        }
    }

    private loadTemplates(): void {
        if (!fs.existsSync(this.templatesPath)) {
            this.logger.warn(`Templates directory not found: ${this.templatesPath}`);
            fs.mkdirSync(this.templatesPath, { recursive: true });
            return;
        }

        const templateFiles = fs
            .readdirSync(this.templatesPath)
            .filter(
                (file) =>
                    file.endsWith('.json') ||
                    file.endsWith('.template.json') ||
                    file.endsWith('.hbs'),
            );
        const filteredFiles = templateFiles.filter((file) => file !== 'subjects.json');

        filteredFiles.forEach((file) => {
            try {
                const templatePath = path.join(this.templatesPath, file);
                const templateContent = fs.readFileSync(templatePath, 'utf-8');

                const templateName = file.replace(/\.template\.json$|\.json$|\.hbs$/, '');
                if (file.endsWith('.hbs')) {
                    this.templates.set(templateName, {
                        subject: this.templateSubjects.get(templateName) || '',
                        html: templateContent,
                    });
                } else {
                    const template = JSON.parse(templateContent);
                    this.templates.set(templateName, {
                        subject: template.subject || this.templateSubjects.get(templateName) || '',
                        html: template.html,
                        text: template.text,
                    });
                }

                this.logger.debug(`Loaded email template: ${templateName}`);
            } catch (err: any) {
                this.logger.error(`Failed to load template ${file}:`, err);
            }
        });
    }

    private loadSubjects(): void {
        const subjectsPath = path.join(this.templatesPath, 'subjects.json');
        if (!fs.existsSync(subjectsPath)) {
            return;
        }
        try {
            const raw = fs.readFileSync(subjectsPath, 'utf-8');
            const data = JSON.parse(raw) as Record<string, string>;
            Object.entries(data).forEach(([key, value]) => {
                this.templateSubjects.set(key, value);
            });
        } catch (err: any) {
            this.logger.error(`Failed to load subjects:`, err);
        }
    }

    private compileTemplate(template: string, context: Record<string, any>): string {
        try {
            return handlebars.compile(template)(context);
        } catch (err: any) {
            this.logger.error('Template compilation failed:', err);
            throw new BadRequestException(`Failed to compile email template: ${err.message}`);
        }
    }

    /** Méthodes utilitaires pour les emails standards */
    private buildTemplateData(
        recipient: MailRecipient,
        extra: Record<string, any> = {},
    ): Record<string, any> {
        return {
            firstName: recipient.firstName,
            lastName: recipient.lastName,
            fullName: recipient.fullName || `${recipient.firstName} ${recipient.lastName}`.trim(),
            email: recipient.email,
            appName: this.config.app.name,
            supportEmail: this.config.app.supportEmail,
            currentYear: new Date().getFullYear(),
            ...extra,
        };
    }

    private resolveSubject(
        explicit: string | undefined,
        templateSubject: string,
        templateName: string,
    ): string {
        if (explicit && explicit.trim().length > 0) {
            return explicit;
        }
        if (templateSubject && templateSubject.trim().length > 0) {
            return templateSubject;
        }
        if (templateName) {
            return this.humanizeTemplateName(templateName);
        }
        return `${this.config.app.name}`;
    }

    private humanizeTemplateName(name: string): string {
        return (
            name
                .replace(/[-_]+/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase())
                .trim() || 'Notification'
        );
    }
}
