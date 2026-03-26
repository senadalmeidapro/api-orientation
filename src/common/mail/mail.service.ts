import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private transporter: nodemailer.Transporter | null = null;
    private from = process.env.SMTP_FROM || 'no-reply@compaspro.local';

    constructor() {
        if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT),
                secure: process.env.SMTP_SECURE === 'true',
                auth: process.env.SMTP_USER
                    ? {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    }
                    : undefined,
            });
        }
    }

    isEnabled() {
        return Boolean(this.transporter);
    }

    async sendPasswordReset(email: string, token: string) {
        if (!this.transporter) {
            this.logger.warn('SMTP non configuré. Email non envoyé.');
            return false;
        }

        const resetUrl = process.env.APP_BASE_URL
            ? `${process.env.APP_BASE_URL}/reset-password?token=${token}`
            : `TOKEN:${token}`;

        await this.transporter.sendMail({
            from: this.from,
            to: email,
            subject: 'Réinitialisation du mot de passe',
            text: `Utilisez ce lien pour réinitialiser votre mot de passe: ${resetUrl}`,
            html: `<p>Utilisez ce lien pour réinitialiser votre mot de passe:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
        });

        return true;
    }
}
