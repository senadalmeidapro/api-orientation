import { ConfigService } from '@nestjs/config';
import { isEmail } from 'class-validator';
import { EmailConfigurationError } from './email.errors';
import { EmailRetryOptions } from './email.types';
import { containsHeaderInjection, normalizeEmail } from './email.utils';

export type EmailTemplateConfig = {
    verificationId?: number;
    passwordResetId?: number;
};

export type EmailConfig = {
    apiKey: string;
    baseUrl: string;
    frontendUrl: string;
    defaultFromEmail: string;
    defaultFromName: string;
    timeoutMs: number;
    retry: Required<EmailRetryOptions>;
    templates: EmailTemplateConfig;
};

const DEFAULT_BASE_URL = 'https://api.brevo.com/v3';
const DEFAULT_FRONTEND_URL = 'http://localhost:5173';
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_BASE_DELAY_MS = 200;
const DEFAULT_RETRY_MAX_DELAY_MS = 2000;

const parsePositiveNumber = (
    value: string | undefined,
    fallback: number,
    field: string,
): number => {
    if (!value) return fallback;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new EmailConfigurationError(`${field} must be a positive number`, field);
    }
    return parsed;
};

const parseOptionalId = (value: string | undefined, field: string): number | undefined => {
    if (!value) return undefined;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new EmailConfigurationError(`${field} must be a positive number`, field);
    }
    return parsed;
};

export const createEmailConfig = (config: ConfigService): EmailConfig => {
    const apiKey = config.get<string>('BREVO_API_KEY')?.trim() ?? '';
    if (!apiKey) {
        throw new EmailConfigurationError('BREVO_API_KEY is required', 'BREVO_API_KEY');
    }

    const defaultFromEmail = normalizeEmail(config.get<string>('DEFAULT_FROM_EMAIL') ?? '');
    if (!defaultFromEmail || !isEmail(defaultFromEmail)) {
        throw new EmailConfigurationError(
            'DEFAULT_FROM_EMAIL must be a valid email',
            'DEFAULT_FROM_EMAIL',
        );
    }

    const defaultFromName = config.get<string>('DEFAULT_FROM_NAME')?.trim() ?? '';
    if (!defaultFromName) {
        throw new EmailConfigurationError('DEFAULT_FROM_NAME is required', 'DEFAULT_FROM_NAME');
    }
    if (containsHeaderInjection(defaultFromName)) {
        throw new EmailConfigurationError('DEFAULT_FROM_NAME contains invalid characters');
    }

    const baseUrl = config.get<string>('BREVO_BASE_URL')?.trim() ?? DEFAULT_BASE_URL;
    try {
        const parsed = new URL(baseUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new EmailConfigurationError(
                'BREVO_BASE_URL must be http or https',
                'BREVO_BASE_URL',
            );
        }
    } catch (error) {
        if (error instanceof EmailConfigurationError) {
            throw error;
        }
        throw new EmailConfigurationError('BREVO_BASE_URL is invalid', 'BREVO_BASE_URL');
    }

    const frontendUrl = config.get<string>('FRONTEND_URL')?.trim() ?? DEFAULT_FRONTEND_URL;
    try {
        const parsed = new URL(frontendUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new EmailConfigurationError('FRONTEND_URL must be http or https', 'FRONTEND_URL');
        }
    } catch (error) {
        if (error instanceof EmailConfigurationError) {
            throw error;
        }
        throw new EmailConfigurationError('FRONTEND_URL is invalid', 'FRONTEND_URL');
    }

    const timeoutMs = parsePositiveNumber(
        config.get<string>('BREVO_TIMEOUT_MS'),
        DEFAULT_TIMEOUT_MS,
        'BREVO_TIMEOUT_MS',
    );
    const maxAttempts = parsePositiveNumber(
        config.get<string>('BREVO_RETRY_MAX_ATTEMPTS'),
        DEFAULT_RETRY_ATTEMPTS,
        'BREVO_RETRY_MAX_ATTEMPTS',
    );
    const baseDelayMs = parsePositiveNumber(
        config.get<string>('BREVO_RETRY_BASE_DELAY_MS'),
        DEFAULT_RETRY_BASE_DELAY_MS,
        'BREVO_RETRY_BASE_DELAY_MS',
    );
    const maxDelayMs = parsePositiveNumber(
        config.get<string>('BREVO_RETRY_MAX_DELAY_MS'),
        DEFAULT_RETRY_MAX_DELAY_MS,
        'BREVO_RETRY_MAX_DELAY_MS',
    );
    if (baseDelayMs > maxDelayMs) {
        throw new EmailConfigurationError(
            'BREVO_RETRY_BASE_DELAY_MS cannot exceed BREVO_RETRY_MAX_DELAY_MS',
            'BREVO_RETRY_BASE_DELAY_MS',
        );
    }

    const verificationId = parseOptionalId(
        config.get<string>('BREVO_TEMPLATE_EMAIL_VERIFICATION_ID'),
        'BREVO_TEMPLATE_EMAIL_VERIFICATION_ID',
    );
    const passwordResetId = parseOptionalId(
        config.get<string>('BREVO_TEMPLATE_PASSWORD_RESET_ID'),
        'BREVO_TEMPLATE_PASSWORD_RESET_ID',
    );

    return {
        apiKey,
        baseUrl,
        frontendUrl,
        defaultFromEmail,
        defaultFromName,
        timeoutMs,
        retry: {
            maxAttempts,
            baseDelayMs,
            maxDelayMs,
        },
        templates: {
            verificationId,
            passwordResetId,
        },
    };
};
