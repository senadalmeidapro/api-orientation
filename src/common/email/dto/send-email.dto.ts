import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';

/**
 * Email address DTO with optional name
 */
export class EmailAddressDto {
    @ApiProperty({ description: 'Email address', example: 'user@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @ApiPropertyOptional({ description: 'Display name', example: 'John Doe' })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    name?: string;
}

/**
 * Retry configuration DTO
 */
export class EmailRetryOptionsDto {
    @ApiPropertyOptional({
        description: 'Maximum number of retry attempts',
        example: 3,
        minimum: 1,
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    maxAttempts?: number;

    @ApiPropertyOptional({
        description: 'Base delay in milliseconds between retries',
        example: 200,
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    baseDelayMs?: number;

    @ApiPropertyOptional({
        description: 'Maximum delay in milliseconds between retries',
        example: 2000,
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    maxDelayMs?: number;
}

/**
 * Send email options DTO
 */
export class SendEmailOptionsDto {
    @ApiPropertyOptional({
        description: 'From address (defaults to configured sender)',
        type: () => EmailAddressDto,
    })
    @ValidateNested()
    @Type(() => EmailAddressDto)
    @IsOptional()
    from?: EmailAddressDto;

    @ApiPropertyOptional({
        description: 'Reply-to address',
        type: () => EmailAddressDto,
    })
    @ValidateNested()
    @Type(() => EmailAddressDto)
    @IsOptional()
    replyTo?: EmailAddressDto;

    @ApiPropertyOptional({
        description: 'CC recipients',
        type: [EmailAddressDto],
    })
    @ValidateNested({ each: true })
    @Type(() => EmailAddressDto)
    @IsArray()
    @IsOptional()
    cc?: EmailAddressDto[];

    @ApiPropertyOptional({
        description: 'BCC recipients',
        type: [EmailAddressDto],
    })
    @ValidateNested({ each: true })
    @Type(() => EmailAddressDto)
    @IsArray()
    @IsOptional()
    bcc?: EmailAddressDto[];

    @ApiPropertyOptional({
        description: 'Custom headers',
        example: { 'X-Custom-Header': 'value' },
    })
    @IsObject()
    @IsOptional()
    headers?: Record<string, string>;

    @ApiPropertyOptional({
        description: 'Tags for tracking',
        example: ['welcome', 'onboarding'],
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @ApiPropertyOptional({
        description: 'Request timeout in milliseconds',
        example: 10000,
        minimum: 1000,
    })
    @IsNumber()
    @Min(1000)
    @IsOptional()
    timeoutMs?: number;

    @ApiPropertyOptional({
        description: 'Retry configuration',
        type: () => EmailRetryOptionsDto,
    })
    @ValidateNested()
    @Type(() => EmailRetryOptionsDto)
    @IsOptional()
    retry?: EmailRetryOptionsDto;

    @ApiPropertyOptional({
        description: 'Allow unsafe HTML (bypasses HTML escaping)',
        example: false,
    })
    @IsBoolean()
    @IsOptional()
    allowUnsafeHtml?: boolean;
}

/**
 * Send standard email DTO
 */
export class SendEmailDto {
    @ApiProperty({
        description: 'Recipients',
        oneOf: [
            { type: 'object', properties: { email: { type: 'string' }, name: { type: 'string' } } },
            {
                type: 'array',
                items: {
                    type: 'object',
                    properties: { email: { type: 'string' }, name: { type: 'string' } },
                },
            },
        ],
        example: { email: 'user@example.com', name: 'John Doe' },
    })
    @ValidateNested({ each: true })
    @Type(() => EmailAddressDto)
    to!: EmailAddressDto | EmailAddressDto[];

    @ApiProperty({
        description: 'Email subject',
        example: 'Welcome to our platform',
        maxLength: 255,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    subject!: string;

    @ApiPropertyOptional({
        description: 'HTML content',
        example: '<h1>Welcome!</h1><p>Thank you for signing up.</p>',
    })
    @IsString()
    @IsOptional()
    html?: string;

    @ApiPropertyOptional({
        description: 'Plain text content',
        example: 'Welcome! Thank you for signing up.',
    })
    @IsString()
    @IsOptional()
    text?: string;
}

/**
 * Send template email DTO
 */
export class SendTemplateEmailDto {
    @ApiProperty({
        description: 'Recipients',
        oneOf: [
            { type: 'object', properties: { email: { type: 'string' }, name: { type: 'string' } } },
            {
                type: 'array',
                items: {
                    type: 'object',
                    properties: { email: { type: 'string' }, name: { type: 'string' } },
                },
            },
        ],
        example: { email: 'user@example.com', name: 'John Doe' },
    })
    @ValidateNested({ each: true })
    @Type(() => EmailAddressDto)
    to!: EmailAddressDto | EmailAddressDto[];

    @ApiProperty({
        description: 'Template ID from Brevo',
        example: 1,
        minimum: 1,
    })
    @IsNumber()
    @IsPositive()
    templateId!: number;

    @ApiPropertyOptional({
        description: 'Template parameters',
        example: { firstName: 'John', verificationUrl: 'https://example.com/verify' },
    })
    @IsObject()
    @IsOptional()
    params?: Record<string, string | number | boolean>;
}

/**
 * Email send result DTO
 */
export class EmailSendResultDto {
    @ApiProperty({
        description: 'Email provider name',
        example: 'brevo',
    })
    provider!: string;

    @ApiPropertyOptional({
        description: 'Provider message ID',
        example: '<202401011234.abc123@smtp-relay.brevo.com>',
    })
    messageId?: string;
}
