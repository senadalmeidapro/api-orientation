import { Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { EmailSendError } from '../email.errors';
import { EmailPayload, TemplateEmailPayload } from '../email.types';
import { BrevoProvider } from './brevo.provider';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('BrevoProvider', () => {
    let provider: BrevoProvider;
    let mockPost: jest.Mock;

    const mockConfig = {
        apiKey: 'test-api-key',
        baseUrl: 'https://api.brevo.com/v3',
        timeoutMs: 5000,
        retry: {
            maxAttempts: 3,
            baseDelayMs: 100,
            maxDelayMs: 1000,
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Logger.prototype, 'log').mockImplementation();
        jest.spyOn(Logger.prototype, 'error').mockImplementation();
        jest.spyOn(Logger.prototype, 'warn').mockImplementation();

        mockPost = jest.fn();
        mockedAxios.create.mockReturnValue({
            post: mockPost,
        } as any);

        provider = new BrevoProvider(mockConfig);
    });

    describe('sendEmail', () => {
        const emailPayload: EmailPayload = {
            to: [{ email: 'recipient@example.com', name: 'John Doe' }],
            from: { email: 'sender@example.com', name: 'Sender' },
            subject: 'Test Email',
            html: '<p>Test content</p>',
            text: 'Test content',
        };

        it('should send email successfully', async () => {
            mockPost.mockResolvedValue({
                data: { messageId: 'msg-123' },
            });

            const result = await provider.sendEmail(emailPayload);

            expect(result).toEqual({
                provider: 'brevo',
                messageId: 'msg-123',
            });
            expect(mockPost).toHaveBeenCalledWith(
                '/smtp/email',
                {
                    sender: { email: 'sender@example.com', name: 'Sender' },
                    to: [{ email: 'recipient@example.com', name: 'John Doe' }],
                    subject: 'Test Email',
                    htmlContent: '<p>Test content</p>',
                    textContent: 'Test content',
                },
                { timeout: 5000 },
            );
        });

        it('should include optional fields when provided', async () => {
            mockPost.mockResolvedValue({
                data: { messageId: 'msg-456' },
            });

            const payloadWithOptionals: EmailPayload = {
                ...emailPayload,
                replyTo: { email: 'reply@example.com' },
                cc: [{ email: 'cc@example.com' }],
                bcc: [{ email: 'bcc@example.com' }],
                headers: { 'X-Custom': 'value' },
                tags: ['test', 'welcome'],
            };

            await provider.sendEmail(payloadWithOptionals);

            expect(mockPost).toHaveBeenCalledWith(
                '/smtp/email',
                {
                    sender: { email: 'sender@example.com', name: 'Sender' },
                    to: [{ email: 'recipient@example.com', name: 'John Doe' }],
                    subject: 'Test Email',
                    htmlContent: '<p>Test content</p>',
                    textContent: 'Test content',
                    replyTo: { email: 'reply@example.com' },
                    cc: [{ email: 'cc@example.com' }],
                    bcc: [{ email: 'bcc@example.com' }],
                    headers: { 'X-Custom': 'value' },
                    tags: ['test', 'welcome'],
                },
                { timeout: 5000 },
            );
        });

        it('should log success', async () => {
            const logSpy = jest.spyOn(Logger.prototype, 'log');
            mockPost.mockResolvedValue({
                data: { messageId: 'msg-789' },
            });

            await provider.sendEmail(emailPayload);

            expect(logSpy).toHaveBeenCalledWith(
                expect.stringContaining('Sending email to recipient@example.com'),
            );
            expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Email sent successfully'));
        });

        it('should throw EmailSendError on network error', async () => {
            mockPost.mockRejectedValue(new Error('Network error'));

            await expect(provider.sendEmail(emailPayload)).rejects.toThrow(EmailSendError);
        });

        it('should throw EmailSendError on timeout', async () => {
            const timeoutError = Object.assign(new Error('timeout'), {
                code: 'ECONNABORTED',
                isAxiosError: true,
                config: {},
            });
            mockedAxios.isAxiosError = jest.fn().mockReturnValue(true);

            mockPost.mockRejectedValue(timeoutError);

            await expect(provider.sendEmail(emailPayload)).rejects.toThrow(
                expect.objectContaining({
                    code: 'timeout',
                    retryable: true,
                }),
            );
        });

        it('should throw EmailSendError on rate limit (429)', async () => {
            const rateLimitError = Object.assign(new Error('Rate limited'), {
                isAxiosError: true,
                response: {
                    status: 429,
                    data: { message: 'Too many requests' },
                },
                config: {},
            });
            mockedAxios.isAxiosError = jest.fn().mockReturnValue(true);

            mockPost.mockRejectedValue(rateLimitError);

            await expect(provider.sendEmail(emailPayload)).rejects.toThrow(
                expect.objectContaining({
                    code: 'rate_limited',
                    status: 429,
                    retryable: true,
                }),
            );
        });

        it('should throw EmailSendError on authentication error (401)', async () => {
            const authError = Object.assign(new Error('Unauthorized'), {
                isAxiosError: true,
                response: {
                    status: 401,
                    data: { message: 'Invalid API key' },
                },
                config: {},
            });
            mockedAxios.isAxiosError = jest.fn().mockReturnValue(true);

            mockPost.mockRejectedValue(authError);

            await expect(provider.sendEmail(emailPayload)).rejects.toThrow(
                expect.objectContaining({
                    code: 'unauthorized',
                    status: 401,
                    retryable: false,
                }),
            );
        });

        it('should retry on retryable errors', async () => {
            const serverError = Object.assign(new Error('Server error'), {
                isAxiosError: true,
                response: {
                    status: 500,
                    data: { message: 'Internal server error' },
                },
                config: {},
            });
            mockedAxios.isAxiosError = jest.fn().mockReturnValue(true);

            mockPost
                .mockRejectedValueOnce(serverError)
                .mockRejectedValueOnce(serverError)
                .mockResolvedValueOnce({ data: { messageId: 'msg-retry' } });

            const result = await provider.sendEmail(emailPayload);

            expect(result.messageId).toBe('msg-retry');
            expect(mockPost).toHaveBeenCalledTimes(3);
        });

        it('should not retry on non-retryable errors', async () => {
            const badRequestError = Object.assign(new Error('Bad request'), {
                isAxiosError: true,
                response: {
                    status: 400,
                    data: { message: 'Invalid email' },
                },
                config: {},
            });
            mockedAxios.isAxiosError = jest.fn().mockReturnValue(true);

            mockPost.mockRejectedValueOnce(badRequestError);

            await expect(provider.sendEmail(emailPayload)).rejects.toThrow(EmailSendError);
            expect(mockPost).toHaveBeenCalledTimes(1);
        });

        it('should respect custom retry options', async () => {
            const serverError = Object.assign(new Error('Server error'), {
                isAxiosError: true,
                response: {
                    status: 500,
                    data: {},
                },
                config: {},
            });
            mockedAxios.isAxiosError = jest.fn().mockReturnValue(true);

            mockPost.mockRejectedValue(serverError);

            await expect(
                provider.sendEmail(emailPayload, { retry: { maxAttempts: 2 } }),
            ).rejects.toThrow(EmailSendError);

            expect(mockPost).toHaveBeenCalledTimes(2);
        });
    });

    describe('sendTemplateEmail', () => {
        const templatePayload: TemplateEmailPayload = {
            to: [{ email: 'recipient@example.com', name: 'John Doe' }],
            from: { email: 'sender@example.com', name: 'Sender' },
            templateId: 1,
            params: { firstName: 'John', verificationUrl: 'https://example.com/verify' },
        };

        it('should send template email successfully', async () => {
            mockPost.mockResolvedValue({
                data: { messageId: 'tmpl-msg-123' },
            });

            const result = await provider.sendTemplateEmail(templatePayload);

            expect(result).toEqual({
                provider: 'brevo',
                messageId: 'tmpl-msg-123',
            });
            expect(mockPost).toHaveBeenCalledWith(
                '/smtp/email',
                {
                    sender: { email: 'sender@example.com', name: 'Sender' },
                    to: [{ email: 'recipient@example.com', name: 'John Doe' }],
                    templateId: 1,
                    params: { firstName: 'John', verificationUrl: 'https://example.com/verify' },
                },
                { timeout: 5000 },
            );
        });

        it('should include optional fields for template email', async () => {
            mockPost.mockResolvedValue({
                data: { messageId: 'tmpl-msg-456' },
            });

            const payloadWithOptionals: TemplateEmailPayload = {
                ...templatePayload,
                replyTo: { email: 'reply@example.com' },
                cc: [{ email: 'cc@example.com' }],
                bcc: [{ email: 'bcc@example.com' }],
                headers: { 'X-Template': 'test' },
                tags: ['template', 'verification'],
            };

            await provider.sendTemplateEmail(payloadWithOptionals);

            expect(mockPost).toHaveBeenCalledWith(
                '/smtp/email',
                {
                    sender: { email: 'sender@example.com', name: 'Sender' },
                    to: [{ email: 'recipient@example.com', name: 'John Doe' }],
                    templateId: 1,
                    params: { firstName: 'John', verificationUrl: 'https://example.com/verify' },
                    replyTo: { email: 'reply@example.com' },
                    cc: [{ email: 'cc@example.com' }],
                    bcc: [{ email: 'bcc@example.com' }],
                    headers: { 'X-Template': 'test' },
                    tags: ['template', 'verification'],
                },
                { timeout: 5000 },
            );
        });

        it('should log template email success', async () => {
            const logSpy = jest.spyOn(Logger.prototype, 'log');
            mockPost.mockResolvedValue({
                data: { messageId: 'tmpl-msg-789' },
            });

            await provider.sendTemplateEmail(templatePayload);

            expect(logSpy).toHaveBeenCalledWith(
                expect.stringContaining('Sending template email (ID: 1)'),
            );
            expect(logSpy).toHaveBeenCalledWith(
                expect.stringContaining('Template email sent successfully'),
            );
        });
    });

    describe('configuration', () => {
        it('should use default values when not provided', () => {
            const minimalConfig = {
                apiKey: 'test-key',
            };

            const providerWithDefaults = new BrevoProvider(minimalConfig);

            expect(providerWithDefaults).toBeDefined();
        });

        it('should create axios client with correct configuration', () => {
            expect(mockedAxios.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    baseURL: mockConfig.baseUrl,
                    timeout: mockConfig.timeoutMs,
                    headers: expect.objectContaining({
                        'api-key': mockConfig.apiKey,
                        'Content-Type': 'application/json',
                    }),
                }),
            );
        });
    });
});
