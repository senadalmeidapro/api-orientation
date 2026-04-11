import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EMAIL_CONFIG, EMAIL_PROVIDER } from './email.constants';
import { createEmailConfig, EmailConfig } from './email.config';
import { EmailService } from './email.service';
import { BrevoProvider } from './providers/brevo.provider';

/**
 * EmailModule provides email sending capabilities
 *
 * Configuration:
 * - Requires environment variables (see .env.example)
 * - Uses Brevo (SendInBlue) as the email provider
 * - Supports templates, retry logic, and comprehensive error handling
 *
 * Usage:
 * ```typescript
 * import { EmailModule } from './common/email/email.module';
 *
 * @Module({
 *   imports: [EmailModule],
 * })
 * export class AppModule {}
 * ```
 */
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: EMAIL_CONFIG,
            useFactory: (configService: ConfigService) => createEmailConfig(configService),
            inject: [ConfigService],
        },
        {
            provide: EMAIL_PROVIDER,
            useFactory: (config: EmailConfig) =>
                new BrevoProvider({
                    apiKey: config.apiKey,
                    baseUrl: config.baseUrl,
                    timeoutMs: config.timeoutMs,
                    retry: config.retry,
                }),
            inject: [EMAIL_CONFIG],
        },
        EmailService,
    ],
    exports: [EmailService],
})
export class EmailModule {}
