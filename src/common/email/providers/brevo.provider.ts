import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { EmailSendError } from '../email.errors';
import { EmailProvider } from '../email.provider';
import {
    EmailPayload,
    EmailProviderSendOptions,
    EmailRetryOptions,
    EmailSendResult,
    TemplateEmailPayload,
} from '../email.types';

/**
 * Brevo API response for successful email send
 */
type BrevoSendEmailResponse = {
    messageId: string;
};

/**
 * Brevo API error response structure
 */
type BrevoErrorResponse = {
    message?: string;
    code?: string;
};

/**
 * Brevo provider configuration
 */
export type BrevoProviderConfig = {
    apiKey: string;
    baseUrl?: string;
    timeoutMs?: number;
    retry?: EmailRetryOptions;
};

/**
 * BrevoProvider implements the EmailProvider interface for Brevo (formerly SendInBlue)
 *
 * Features:
 * - Exponential backoff retry logic for transient failures
 * - Comprehensive error handling with categorization
 * - Rate limit detection and handling
 * - Request/response logging
 * - Configurable timeouts
 *
 * @see https://developers.brevo.com/reference/sendtransacemail
 */
@Injectable()
export class BrevoProvider implements EmailProvider {
    private readonly logger = new Logger(BrevoProvider.name);
    private readonly client: AxiosInstance;
    private readonly retry: Required<EmailRetryOptions>;

    constructor(private readonly config: BrevoProviderConfig) {
        this.client = axios.create({
            baseURL: config.baseUrl ?? 'https://api.brevo.com/v3',
            timeout: config.timeoutMs ?? 10000,
            headers: {
                'api-key': config.apiKey,
                'Content-Type': 'application/json',
            },
        });

        this.retry = {
            maxAttempts: config.retry?.maxAttempts ?? 3,
            baseDelayMs: config.retry?.baseDelayMs ?? 200,
            maxDelayMs: config.retry?.maxDelayMs ?? 2000,
        };
    }

    /**
     * Send a standard email with HTML/text content
     */
    async sendEmail(
        payload: EmailPayload,
        options?: EmailProviderSendOptions,
    ): Promise<EmailSendResult> {
        const startTime = Date.now();
        const requestBody = this.buildEmailRequest(payload);
        // #region agent log
        void fetch('http://127.0.0.1:7242/ingest/acdc9a68-6d41-41ca-9274-181ae653d00d', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                runId: 'initial-debug',
                hypothesisId: 'H1',
                location: 'src/common/email/providers/brevo.provider.ts:82',
                message: 'Brevo sendEmail options received',
                data: {
                    hasCustomTimeout: Boolean(options?.timeoutMs),
                    customTimeoutMs: options?.timeoutMs ?? null,
                    retryMaxAttempts: options?.retry?.maxAttempts ?? null,
                    recipientCount: payload.to.length,
                },
                timestamp: Date.now(),
            }),
        }).catch(() => {});
        // #endregion

        try {
            this.logger.log(
                `Sending email to ${payload.to.map((r) => r.email).join(', ')} - Subject: "${payload.subject}"`,
            );

            const messageId = await this.executeWithRetry(
                () => this.sendRequest('/smtp/email', requestBody, options?.timeoutMs),
                options?.retry,
            );

            const duration = Date.now() - startTime;
            this.logger.log(`Email sent successfully in ${duration}ms - MessageId: ${messageId}`);

            return { provider: 'brevo', messageId };
        } catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(
                `Failed to send email after ${duration}ms: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    /**
     * Send an email using a pre-configured Brevo template
     */
    async sendTemplateEmail(
        payload: TemplateEmailPayload,
        options?: EmailProviderSendOptions,
    ): Promise<EmailSendResult> {
        const startTime = Date.now();
        const requestBody = this.buildTemplateEmailRequest(payload);

        try {
            this.logger.log(
                `Sending template email (ID: ${payload.templateId}) to ${payload.to.map((r) => r.email).join(', ')}`,
            );

            const messageId = await this.executeWithRetry(
                () => this.sendRequest('/smtp/email', requestBody, options?.timeoutMs),
                options?.retry,
            );

            const duration = Date.now() - startTime;
            this.logger.log(
                `Template email sent successfully in ${duration}ms - MessageId: ${messageId}`,
            );

            return { provider: 'brevo', messageId };
        } catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(
                `Failed to send template email after ${duration}ms: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    /**
     * Execute request with exponential backoff retry logic
     */
    private async executeWithRetry(
        operation: () => Promise<string>,
        customRetry?: EmailRetryOptions,
    ): Promise<string> {
        const retry = customRetry
            ? {
                  maxAttempts: customRetry.maxAttempts ?? this.retry.maxAttempts,
                  baseDelayMs: customRetry.baseDelayMs ?? this.retry.baseDelayMs,
                  maxDelayMs: customRetry.maxDelayMs ?? this.retry.maxDelayMs,
              }
            : this.retry;

        let lastError: Error | undefined;

        for (let attempt = 1; attempt <= retry.maxAttempts; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');

                // Don't retry if error is not retryable
                if (error instanceof EmailSendError && !error.retryable) {
                    throw error;
                }

                // Don't retry on last attempt
                if (attempt === retry.maxAttempts) {
                    break;
                }

                // Calculate delay with exponential backoff
                const delay = Math.min(
                    retry.baseDelayMs * Math.pow(2, attempt - 1),
                    retry.maxDelayMs,
                );

                this.logger.warn(
                    `Attempt ${attempt}/${retry.maxAttempts} failed: ${lastError.message}. Retrying in ${delay}ms...`,
                );

                await this.sleep(delay);
            }
        }

        throw lastError ?? new Error('Request failed');
    }

    /**
     * Send HTTP request to Brevo API
     */
    private async sendRequest(
        endpoint: string,
        data: unknown,
        timeoutMs?: number,
    ): Promise<string> {
        try {
            // #region agent log
            void fetch('http://127.0.0.1:7242/ingest/acdc9a68-6d41-41ca-9274-181ae653d00d', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    runId: 'post-fix',
                    hypothesisId: 'H1',
                    location: 'src/common/email/providers/brevo.provider.ts:198',
                    message: 'Brevo HTTP request timeout decision',
                    data: {
                        endpoint,
                        clientDefaultTimeoutMs: this.config.timeoutMs ?? 10000,
                        effectiveTimeoutMs: timeoutMs ?? this.config.timeoutMs ?? 10000,
                        usesPerRequestTimeout: Boolean(timeoutMs),
                    },
                    timestamp: Date.now(),
                }),
            }).catch(() => {});
            // #endregion
            const response = await this.client.post<BrevoSendEmailResponse>(endpoint, data, {
                timeout: timeoutMs ?? this.config.timeoutMs ?? 10000,
            });
            return response.data.messageId;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Build request body for standard email
     */
    private buildEmailRequest(payload: EmailPayload): Record<string, unknown> {
        const request: Record<string, unknown> = {
            sender: { email: payload.from.email, name: payload.from.name },
            to: payload.to.map((r) => ({ email: r.email, name: r.name })),
            subject: payload.subject,
        };

        if (payload.html) request.htmlContent = payload.html;
        if (payload.text) request.textContent = payload.text;
        if (payload.replyTo) {
            request.replyTo = { email: payload.replyTo.email, name: payload.replyTo.name };
        }
        if (payload.cc && payload.cc.length > 0) {
            request.cc = payload.cc.map((r) => ({ email: r.email, name: r.name }));
        }
        if (payload.bcc && payload.bcc.length > 0) {
            request.bcc = payload.bcc.map((r) => ({ email: r.email, name: r.name }));
        }
        if (payload.headers) request.headers = payload.headers;
        if (payload.tags && payload.tags.length > 0) request.tags = payload.tags;

        return request;
    }

    /**
     * Build request body for template email
     */
    private buildTemplateEmailRequest(payload: TemplateEmailPayload): Record<string, unknown> {
        const request: Record<string, unknown> = {
            sender: { email: payload.from.email, name: payload.from.name },
            to: payload.to.map((r) => ({ email: r.email, name: r.name })),
            templateId: payload.templateId,
        };

        if (payload.params) request.params = payload.params;
        if (payload.replyTo) {
            request.replyTo = { email: payload.replyTo.email, name: payload.replyTo.name };
        }
        if (payload.cc && payload.cc.length > 0) {
            request.cc = payload.cc.map((r) => ({ email: r.email, name: r.name }));
        }
        if (payload.bcc && payload.bcc.length > 0) {
            request.bcc = payload.bcc.map((r) => ({ email: r.email, name: r.name }));
        }
        if (payload.headers) request.headers = payload.headers;
        if (payload.tags && payload.tags.length > 0) request.tags = payload.tags;

        return request;
    }

    /**
     * Handle and categorize errors from Brevo API
     */
    private handleError(error: unknown): EmailSendError {
        // Handle Axios errors
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<BrevoErrorResponse>;
            // #region agent log
            void fetch('http://127.0.0.1:7242/ingest/acdc9a68-6d41-41ca-9274-181ae653d00d', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    runId: 'initial-debug',
                    hypothesisId: 'H2',
                    location: 'src/common/email/providers/brevo.provider.ts:265',
                    message: 'Brevo axios error observed',
                    data: {
                        hasResponse: Boolean(axiosError.response),
                        status: axiosError.response?.status ?? null,
                        code: axiosError.code ?? null,
                    },
                    timestamp: Date.now(),
                }),
            }).catch(() => {});
            // #endregion

            // Network or timeout errors
            if (!axiosError.response) {
                if (axiosError.code === 'ECONNABORTED') {
                    return new EmailSendError('Request timeout', {
                        code: 'timeout',
                        provider: 'brevo',
                        retryable: true,
                    });
                }
                return new EmailSendError('Network error', {
                    code: 'network_error',
                    provider: 'brevo',
                    retryable: true,
                });
            }

            const status = axiosError.response.status;
            const message = axiosError.response.data?.message ?? axiosError.message;

            // Rate limiting
            if (status === 429) {
                return new EmailSendError('Rate limit exceeded', {
                    code: 'rate_limited',
                    provider: 'brevo',
                    status,
                    retryable: true,
                });
            }

            // Authentication errors
            if (status === 401) {
                return new EmailSendError('Invalid API key', {
                    code: 'unauthorized',
                    provider: 'brevo',
                    status,
                    retryable: false,
                });
            }

            // Permission errors
            if (status === 403) {
                return new EmailSendError('Permission denied', {
                    code: 'forbidden',
                    provider: 'brevo',
                    status,
                    retryable: false,
                });
            }

            // Bad request errors
            if (status >= 400 && status < 500) {
                return new EmailSendError(message || 'Invalid request', {
                    code: 'invalid_payload',
                    provider: 'brevo',
                    status,
                    retryable: false,
                });
            }

            // Server errors
            if (status >= 500) {
                return new EmailSendError(message || 'Server error', {
                    code: 'provider_error',
                    provider: 'brevo',
                    status,
                    retryable: true,
                });
            }
        }

        // Unknown errors
        const message = error instanceof Error ? error.message : 'Unknown error';
        return new EmailSendError(message, {
            code: 'provider_error',
            provider: 'brevo',
            retryable: false,
        });
    }

    /**
     * Sleep for specified milliseconds
     */
    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
