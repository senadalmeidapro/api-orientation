export type EmailAddress = {
    email: string;
    name?: string;
};

export type EmailAddressInput = { email: string; name?: string | null } | string;

export type TemplateParamValue = string | number | boolean | Date | null | undefined;

export type TemplateParams = Record<string, TemplateParamValue>;

export type EmailRetryOptions = {
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
};

export type SendEmailOptions = {
    from?: EmailAddressInput;
    replyTo?: EmailAddressInput;
    cc?: EmailAddressInput[];
    bcc?: EmailAddressInput[];
    headers?: Record<string, string>;
    tags?: string[];
    timeoutMs?: number;
    retry?: EmailRetryOptions;
    allowUnsafeHtml?: boolean;
};

export type SendEmailPayload = {
    to: EmailAddressInput | EmailAddressInput[];
    subject: string;
    html?: string;
    text?: string;
};

export type SendTemplateEmailPayload = {
    to: EmailAddressInput | EmailAddressInput[];
    templateId: number;
    params?: TemplateParams;
};

export type EmailPayload = {
    to: EmailAddress[];
    from: EmailAddress;
    subject: string;
    html?: string;
    text?: string;
    replyTo?: EmailAddress;
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    headers?: Record<string, string>;
    tags?: string[];
};

export type TemplateEmailPayload = {
    to: EmailAddress[];
    from: EmailAddress;
    templateId: number;
    params?: Record<string, string | number | boolean>;
    replyTo?: EmailAddress;
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    headers?: Record<string, string>;
    tags?: string[];
};

export type EmailSendResult = {
    provider: string;
    messageId?: string;
};

export type EmailProviderSendOptions = {
    timeoutMs?: number;
    retry?: EmailRetryOptions;
};
