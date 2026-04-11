import {
    EmailPayload,
    EmailProviderSendOptions,
    EmailSendResult,
    TemplateEmailPayload,
} from './email.types';

export interface EmailProvider {
    sendEmail(payload: EmailPayload, options?: EmailProviderSendOptions): Promise<EmailSendResult>;
    sendTemplateEmail(
        payload: TemplateEmailPayload,
        options?: EmailProviderSendOptions,
    ): Promise<EmailSendResult>;
}
