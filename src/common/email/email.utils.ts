import { isEmail } from 'class-validator';
import { EmailValidationError } from './email.errors';
import { EmailAddress, EmailAddressInput, TemplateParamValue, TemplateParams } from './email.types';

const HEADER_INJECTION_PATTERN = /[\r\n]/;
const HEADER_NAME_PATTERN = /^[A-Za-z0-9-]+$/;
const TEMPLATE_KEY_PATTERN = /^[A-Za-z0-9_.-]+$/;

export const containsHeaderInjection = (value: string): boolean =>
    HEADER_INJECTION_PATTERN.test(value);

export const assertNoHeaderInjection = (value: string, field: string): void => {
    if (containsHeaderInjection(value)) {
        throw new EmailValidationError(`Invalid ${field}`, field);
    }
};

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const normalizeName = (name?: string | null): string | undefined => {
    if (!name) return undefined;
    const trimmed = name.trim();
    if (!trimmed) return undefined;
    assertNoHeaderInjection(trimmed, 'name');
    return trimmed;
};

export const ensureEmailAddress = (input: EmailAddressInput, field: string): EmailAddress => {
    const raw = typeof input === 'string' ? { email: input } : input;
    const email = normalizeEmail(raw.email);
    if (!email || !isEmail(email)) {
        throw new EmailValidationError(`Invalid ${field} email`, field);
    }
    assertNoHeaderInjection(email, field);
    const name = normalizeName(raw.name ?? undefined);
    return name ? { email, name } : { email };
};

export const ensureRecipientList = (
    input: EmailAddressInput | EmailAddressInput[],
    field: string,
): EmailAddress[] => {
    const list = Array.isArray(input) ? input : [input];
    if (list.length === 0) {
        throw new EmailValidationError(`Missing ${field} recipients`, field);
    }
    return list.map((recipient, index) => ensureEmailAddress(recipient, `${field}[${index}]`));
};

export const sanitizeSubject = (subject: string): string => {
    const trimmed = subject.trim();
    if (!trimmed) {
        throw new EmailValidationError('Subject is required', 'subject');
    }
    assertNoHeaderInjection(trimmed, 'subject');
    return trimmed;
};

export const sanitizeHeaders = (
    headers?: Record<string, string>,
): Record<string, string> | undefined => {
    if (!headers) return undefined;
    const sanitized: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
        const headerKey = key.trim();
        if (!headerKey || !HEADER_NAME_PATTERN.test(headerKey)) {
            throw new EmailValidationError('Invalid header name', `headers.${key}`);
        }
        const headerValue = String(value ?? '').trim();
        assertNoHeaderInjection(headerValue, `headers.${headerKey}`);
        sanitized[headerKey] = headerValue;
    }
    return Object.keys(sanitized).length ? sanitized : undefined;
};

export const sanitizeTags = (tags?: string[]): string[] | undefined => {
    if (!tags) return undefined;
    const sanitized = tags.map((tag) => tag.trim()).filter(Boolean);
    for (const tag of sanitized) {
        assertNoHeaderInjection(tag, 'tags');
    }
    return sanitized.length ? sanitized : undefined;
};

export const escapeHtml = (value: string): string =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const normalizeTemplateValue = (value: TemplateParamValue): string | number | boolean => {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'number' || typeof value === 'boolean') return value;
    return String(value);
};

export const sanitizeTemplateParams = (
    params?: TemplateParams,
    options?: { escapeHtml?: boolean },
): Record<string, string | number | boolean> | undefined => {
    if (!params) return undefined;
    const escapeValues = options?.escapeHtml ?? true;
    const sanitized: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(params)) {
        const paramKey = key.trim();
        if (!paramKey || !TEMPLATE_KEY_PATTERN.test(paramKey)) {
            throw new EmailValidationError('Invalid template param key', `params.${key}`);
        }
        const normalized = normalizeTemplateValue(value);
        if (typeof normalized === 'string') {
            sanitized[paramKey] = escapeValues ? escapeHtml(normalized) : normalized;
        } else {
            sanitized[paramKey] = normalized;
        }
    }
    return Object.keys(sanitized).length ? sanitized : undefined;
};

export const renderTemplate = (
    template: string,
    params: TemplateParams,
    options?: { escapeHtml?: boolean },
): string => {
    const escapeValues = options?.escapeHtml ?? true;
    return template.replace(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g, (_match, key: string) => {
        const normalized = normalizeTemplateValue(params[key]);
        if (typeof normalized === 'string') {
            return escapeValues ? escapeHtml(normalized) : normalized;
        }
        return String(normalized);
    });
};
