import { Test, TestingModule } from '@nestjs/testing';
import { EMAIL_CONFIG, EMAIL_PROVIDER } from './email.constants';
import { EmailConfig } from './email.config';
import { EmailSendError, EmailValidationError } from './email.errors';
import { EmailProvider } from './email.provider';
import { EmailService } from './email.service';

describe('EmailService', () => {
    let service: EmailService;
    let mockProvider: jest.Mocked<EmailProvider>;

    const mockConfig: EmailConfig = {
        apiKey: 'test-api-key',
        baseUrl: 'https://api.brevo.com/v3',
        frontendUrl: 'http://localhost:5173',
        defaultFromEmail: 'noreply@example.com',
        defaultFromName: 'Test App',
        timeoutMs: 10000,
        retry: {
            maxAttempts: 3,
            baseDelayMs: 200,
            maxDelayMs: 2000,
        },
        templates: {
            verificationId: 1,
            passwordResetId: 2,
        },
    };

    beforeEach(async () => {
        mockProvider = {
            sendEmail: jest.fn(),
            sendTemplateEmail: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailService,
                {
                    provide: EMAIL_PROVIDER,
                    useValue: mockProvider,
                },
                {
                    provide: EMAIL_CONFIG,
                    useValue: mockConfig,
                },
            ],
        }).compile();

        service = module.get<EmailService>(EmailService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('sendEmail', () => {
        it('should send a basic email successfully', async () => {
            mockProvider.sendEmail.mockResolvedValue({
                provider: 'brevo',
                messageId: 'msg-123',
            });

            const result = await service.sendEmail({
                to: 'recipient@example.com',
                subject: 'Test Email',
                html: '<p>Test content</p>',
            });

            expect(result).toEqual({
                provider: 'brevo',
                messageId: 'msg-123',
            });

            expect(mockProvider.sendEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: [{ email: 'recipient@example.com' }],
                    from: { email: 'noreply@example.com', name: 'Test App' },
                    subject: 'Test Email',
                    html: '<p>Test content</p>',
                }),
                {},
            );
        });

        it('should send email to multiple recipients', async () => {
            mockProvider.sendEmail.mockResolvedValue({
                provider: 'brevo',
                messageId: 'msg-456',
            });

            await service.sendEmail({
                to: ['user1@example.com', 'user2@example.com'],
                subject: 'Bulk Email',
                text: 'Test content',
            });

            expect(mockProvider.sendEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: [{ email: 'user1@example.com' }, { email: 'user2@example.com' }],
                }),
                expect.any(Object),
            );
        });

        it('should use custom from address when provided', async () => {
            mockProvider.sendEmail.mockResolvedValue({
                provider: 'brevo',
                messageId: 'msg-789',
            });

            await service.sendEmail(
                {
                    to: 'recipient@example.com',
                    subject: 'Test Email',
                    html: '<p>Test</p>',
                },
                {
                    from: { email: 'custom@example.com', name: 'Custom Sender' },
                },
            );

            expect(mockProvider.sendEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    from: { email: 'custom@example.com', name: 'Custom Sender' },
                }),
                expect.any(Object),
            );
        });

        it('should include optional fields when provided', async () => {
            mockProvider.sendEmail.mockResolvedValue({
                provider: 'brevo',
                messageId: 'msg-abc',
            });

            await service.sendEmail(
                {
                    to: 'recipient@example.com',
                    subject: 'Test Email',
                    html: '<p>Test</p>',
                    text: 'Test',
                },
                {
                    replyTo: 'reply@example.com',
                    cc: ['cc@example.com'],
                    bcc: ['bcc@example.com'],
                    headers: { 'X-Custom': 'value' },
                    tags: ['test'],
                },
            );

            expect(mockProvider.sendEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    replyTo: { email: 'reply@example.com' },
                    cc: [{ email: 'cc@example.com' }],
                    bcc: [{ email: 'bcc@example.com' }],
                    headers: { 'X-Custom': 'value' },
                    tags: ['test'],
                }),
                expect.any(Object),
            );
        });

        it('should throw error when neither html nor text is provided', async () => {
            await expect(
                service.sendEmail({
                    to: 'recipient@example.com',
                    subject: 'Test Email',
                }),
            ).rejects.toThrow(EmailValidationError);
        });

        it('should throw error on invalid email address', async () => {
            await expect(
                service.sendEmail({
                    to: 'invalid-email',
                    subject: 'Test Email',
                    html: '<p>Test</p>',
                }),
            ).rejects.toThrow(EmailValidationError);
        });

        it('should sanitize subject and prevent header injection', async () => {
            mockProvider.sendEmail.mockResolvedValue({
                provider: 'brevo',
                messageId: 'msg-def',
            });

            await service.sendEmail({
                to: 'recipient@example.com',
                subject: '  Test Subject  ',
                html: '<p>Test</p>',
            });

            expect(mockProvider.sendEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    subject: 'Test Subject',
                }),
                expect.any(Object),
            );
        });

        it('should forward provider options', async () => {
            mockProvider.sendEmail.mockResolvedValue({
                provider: 'brevo',
                messageId: 'msg-ghi',
            });

            await service.sendEmail(
                {
                    to: 'recipient@example.com',
                    subject: 'Test Email',
                    html: '<p>Test</p>',
                },
                {
                    timeoutMs: 5000,
                    retry: { maxAttempts: 2 },
                },
            );

            expect(mockProvider.sendEmail).toHaveBeenCalledWith(expect.any(Object), {
                timeoutMs: 5000,
                retry: { maxAttempts: 2 },
            });
        });
    });

    describe('sendTemplateEmail', () => {
        it('should send template email successfully', async () => {
            mockProvider.sendTemplateEmail.mockResolvedValue({
                provider: 'brevo',
                messageId: 'tmpl-msg-123',
            });

            const result = await service.sendTemplateEmail({
                to: 'recipient@example.com',
                templateId: 1,
                params: { firstName: 'John', url: 'https://example.com' },
            });

            expect(result).toEqual({
                provider: 'brevo',
                messageId: 'tmpl-msg-123',
            });

            expect(mockProvider.sendTemplateEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: [{ email: 'recipient@example.com' }],
                    from: { email: 'noreply@example.com', name: 'Test App' },
                    templateId: 1,
                    params: { firstName: 'John', url: 'https://example.com' },
                }),
                {},
            );
        });

        it('should throw error on invalid template ID', async () => {
            await expect(
                service.sendTemplateEmail({
                    to: 'recipient@example.com',
                    templateId: -1,
                }),
            ).rejects.toThrow(EmailValidationError);

            await expect(
                service.sendTemplateEmail({
                    to: 'recipient@example.com',
                    templateId: 0,
                }),
            ).rejects.toThrow(EmailValidationError);

            await expect(
                service.sendTemplateEmail({
                    to: 'recipient@example.com',
                    templateId: 1.5,
                }),
            ).rejects.toThrow(EmailValidationError);
        });

        it('should sanitize and escape template params by default', async () => {
            mockProvider.sendTemplateEmail.mockResolvedValue({
                provider: 'brevo',
                messageId: 'tmpl-msg-456',
            });

            await service.sendTemplateEmail({
                to: 'recipient@example.com',
                templateId: 1,
                params: { firstName: '<script>alert("XSS")</script>' },
            });

            expect(mockProvider.sendTemplateEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        firstName: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;',
                    }),
                }),
                expect.any(Object),
            );
        });

        it('should not escape params when allowUnsafeHtml is true', async () => {
            mockProvider.sendTemplateEmail.mockResolvedValue({
                provider: 'brevo',
                messageId: 'tmpl-msg-789',
            });

            await service.sendTemplateEmail(
                {
                    to: 'recipient@example.com',
                    templateId: 1,
                    params: { content: '<strong>Bold</strong>' },
                },
                {
                    allowUnsafeHtml: true,
                },
            );

            expect(mockProvider.sendTemplateEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        content: '<strong>Bold</strong>',
                    }),
                }),
                expect.any(Object),
            );
        });
    });

    describe('sendVerificationEmail', () => {
        it('should send verification email successfully', async () => {
            mockProvider.sendTemplateEmail.mockResolvedValue({
                provider: 'brevo',
                messageId: 'verify-msg-123',
            });

            const result = await service.sendVerificationEmail({
                to: 'user@example.com',
                firstName: 'John',
                token: 'verify-token-123',
                userId: 'user-id-456',
            });

            expect(result).toEqual({
                provider: 'brevo',
                messageId: 'verify-msg-123',
            });

            expect(mockProvider.sendTemplateEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: [{ email: 'user@example.com' }],
                    templateId: 1,
                    params: expect.objectContaining({
                        firstName: 'John',
                        token: 'verify-token-123',
                    }),
                }),
                expect.any(Object),
            );
        });

        it('should use default name when firstName is null', async () => {
            mockProvider.sendTemplateEmail.mockResolvedValue({
                provider: 'brevo',
                messageId: 'verify-msg-456',
            });

            await service.sendVerificationEmail({
                to: 'user@example.com',
                firstName: null,
                token: 'verify-token',
                userId: 'user-id',
            });

            expect(mockProvider.sendTemplateEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        firstName: 'User',
                    }),
                }),
                expect.any(Object),
            );
        });

        it('should throw error when template is not configured', async () => {
            const serviceWithoutTemplate = new EmailService(mockProvider, {
                ...mockConfig,
                templates: {},
            });

            await expect(
                serviceWithoutTemplate.sendVerificationEmail({
                    to: 'user@example.com',
                    firstName: 'John',
                    token: 'token',
                    userId: 'user-id',
                }),
            ).rejects.toThrow(EmailSendError);
        });
    });

    describe('sendPasswordResetEmail', () => {
        it('should send password reset email successfully', async () => {
            mockProvider.sendTemplateEmail.mockResolvedValue({
                provider: 'brevo',
                messageId: 'reset-msg-123',
            });

            const result = await service.sendPasswordResetEmail({
                to: 'user@example.com',
                firstName: 'Jane',
                token: 'reset-token-123',
                userId: 'user-id-789',
            });

            expect(result).toEqual({
                provider: 'brevo',
                messageId: 'reset-msg-123',
            });

            expect(mockProvider.sendTemplateEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: [{ email: 'user@example.com' }],
                    templateId: 2,
                    params: expect.objectContaining({
                        firstName: 'Jane',
                        token: 'reset-token-123',
                    }),
                }),
                expect.any(Object),
            );
        });

        it('should throw error when template is not configured', async () => {
            const serviceWithoutTemplate = new EmailService(mockProvider, {
                ...mockConfig,
                templates: {},
            });

            await expect(
                serviceWithoutTemplate.sendPasswordResetEmail({
                    to: 'user@example.com',
                    firstName: 'Jane',
                    token: 'token',
                    userId: 'user-id',
                }),
            ).rejects.toThrow(EmailSendError);
        });
    });

    describe('sendEmailFromTemplate', () => {
        it('should render and send email from template string', async () => {
            mockProvider.sendEmail.mockResolvedValue({
                provider: 'brevo',
                messageId: 'tmpl-str-123',
            });

            const result = await service.sendEmailFromTemplate({
                to: 'user@example.com',
                subject: 'Hello {{firstName}}!',
                htmlTemplate: '<h1>Welcome {{firstName}}</h1><p>Your email: {{email}}</p>',
                textTemplate: 'Welcome {{firstName}}\nYour email: {{email}}',
                params: { firstName: 'John', email: 'john@example.com' },
            });

            expect(result).toEqual({
                provider: 'brevo',
                messageId: 'tmpl-str-123',
            });

            expect(mockProvider.sendEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    subject: 'Hello John!',
                    html: '<h1>Welcome John</h1><p>Your email: john@example.com</p>',
                    text: 'Welcome John\nYour email: john@example.com',
                }),
                expect.any(Object),
            );
        });

        it('should escape HTML in template params by default', async () => {
            mockProvider.sendEmail.mockResolvedValue({
                provider: 'brevo',
                messageId: 'tmpl-str-456',
            });

            await service.sendEmailFromTemplate({
                to: 'user@example.com',
                subject: 'Test',
                htmlTemplate: '<p>{{content}}</p>',
                params: { content: '<script>alert("XSS")</script>' },
            });

            expect(mockProvider.sendEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: '<p>&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;</p>',
                }),
                expect.any(Object),
            );
        });

        it('should not escape when allowUnsafeHtml is true', async () => {
            mockProvider.sendEmail.mockResolvedValue({
                provider: 'brevo',
                messageId: 'tmpl-str-789',
            });

            await service.sendEmailFromTemplate(
                {
                    to: 'user@example.com',
                    subject: 'Test',
                    htmlTemplate: '<div>{{content}}</div>',
                    params: { content: '<strong>Bold</strong>' },
                },
                {
                    allowUnsafeHtml: true,
                },
            );

            expect(mockProvider.sendEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: '<div><strong>Bold</strong></div>',
                }),
                expect.any(Object),
            );
        });
    });

    describe('error handling', () => {
        it('should propagate provider errors', async () => {
            const providerError = new EmailSendError('Provider failed', {
                code: 'provider_error',
                provider: 'brevo',
            });

            mockProvider.sendEmail.mockRejectedValue(providerError);

            await expect(
                service.sendEmail({
                    to: 'user@example.com',
                    subject: 'Test',
                    html: '<p>Test</p>',
                }),
            ).rejects.toThrow(providerError);
        });
    });
});
