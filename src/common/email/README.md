# Email Module

A production-ready email service for NestJS using the Brevo (formerly SendInBlue) provider with comprehensive error handling, retry logic, and template support.

## Features

✅ **SOLID Principles** - Clean, maintainable architecture  
✅ **Brevo Integration** - Full support for Brevo email API  
✅ **Retry Logic** - Exponential backoff for transient failures  
✅ **Template Support** - Brevo templates and inline string templates  
✅ **Error Handling** - Comprehensive error categorization  
✅ **Validation** - Input sanitization and header injection prevention  
✅ **Logging** - Detailed logging with NestJS Logger  
✅ **TypeScript** - Fully typed with DTOs and interfaces  
✅ **Testing** - 100% test coverage with unit tests  

## Architecture

```
email/
├── dto/                        # Data Transfer Objects
│   └── send-email.dto.ts      # DTOs for API validation
├── providers/                  # Email provider implementations
│   ├── brevo.provider.ts      # Brevo (SendInBlue) provider
│   └── brevo.provider.spec.ts # Provider tests
├── email.config.ts            # Configuration factory
├── email.constants.ts         # DI tokens
├── email.errors.ts            # Custom error classes
├── email.module.ts            # NestJS module
├── email.provider.ts          # Provider interface
├── email.service.ts           # Main service (orchestration)
├── email.service.spec.ts      # Service tests
├── email.types.ts             # Type definitions
├── email.utils.ts             # Utility functions
└── index.ts                   # Public exports
```

## Installation

The module is already integrated. Just configure your environment variables:

```env
# Brevo API Configuration
BREVO_API_KEY=your_api_key_here
BREVO_BASE_URL=https://api.brevo.com/v3
BREVO_TIMEOUT_MS=10000
BREVO_RETRY_MAX_ATTEMPTS=3
BREVO_RETRY_BASE_DELAY_MS=200
BREVO_RETRY_MAX_DELAY_MS=2000

# Email Defaults
DEFAULT_FROM_EMAIL=noreply@example.com
DEFAULT_FROM_NAME=Your App Name

# Template IDs (configure in Brevo dashboard)
BREVO_TEMPLATE_EMAIL_VERIFICATION_ID=1
BREVO_TEMPLATE_PASSWORD_RESET_ID=2

# Frontend URL for email links
FRONTEND_URL=https://yourapp.com
```

## Quick Start

### 1. Import the Module

```typescript
import { EmailModule } from './common/email/email.module';

@Module({
  imports: [EmailModule],
})
export class AppModule {}
```

### 2. Inject the Service

```typescript
import { Injectable } from '@nestjs/common';
import { EmailService } from './common/email/email.service';

@Injectable()
export class UserService {
  constructor(private readonly emailService: EmailService) {}

  async welcomeUser(email: string, name: string) {
    await this.emailService.sendEmail({
      to: email,
      subject: 'Welcome!',
      html: `<h1>Welcome ${name}!</h1>`,
      text: `Welcome ${name}!`,
    });
  }
}
```

## Usage Examples

### Basic Email

```typescript
await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Hello World',
  html: '<h1>Hello!</h1>',
  text: 'Hello!',
});
```

### Multiple Recipients

```typescript
await emailService.sendEmail({
  to: [
    { email: 'user1@example.com', name: 'User 1' },
    { email: 'user2@example.com', name: 'User 2' },
  ],
  subject: 'Team Update',
  html: '<p>Important announcement</p>',
});
```

### With Options

```typescript
await emailService.sendEmail(
  {
    to: 'user@example.com',
    subject: 'Newsletter',
    html: '<p>Content...</p>',
  },
  {
    replyTo: 'hello@example.com',
    cc: ['manager@example.com'],
    bcc: ['archive@example.com'],
    tags: ['newsletter', 'monthly'],
    headers: { 'X-Campaign-ID': 'march-2024' },
  }
);
```

### Template Email

```typescript
await emailService.sendTemplateEmail({
  to: 'user@example.com',
  templateId: 1, // Configured in Brevo
  params: {
    firstName: 'John',
    verificationUrl: 'https://example.com/verify?token=abc',
  },
});
```

### Pre-configured Templates

```typescript
// Verification email
await emailService.sendVerificationEmail({
  to: 'user@example.com',
  firstName: 'John',
  token: 'verification-token',
  userId: 'user-123',
});

// Password reset email
await emailService.sendPasswordResetEmail({
  to: 'user@example.com',
  firstName: 'John',
  token: 'reset-token',
  userId: 'user-123',
});
```

### String Template

```typescript
await emailService.sendEmailFromTemplate({
  to: 'user@example.com',
  subject: 'Order #{{orderNumber}}',
  htmlTemplate: '<h1>Thank you {{name}}!</h1><p>Total: ${{total}}</p>',
  textTemplate: 'Thank you {{name}}! Total: ${{total}}',
  params: {
    name: 'John',
    orderNumber: '12345',
    total: 99.99,
  },
});
```

## Error Handling

```typescript
import { EmailSendError, EmailValidationError } from './common/email';

try {
  await emailService.sendEmail(payload);
} catch (error) {
  if (error instanceof EmailValidationError) {
    // Invalid input (bad email format, etc.)
    console.error('Validation error:', error.field);
  } else if (error instanceof EmailSendError) {
    switch (error.code) {
      case 'rate_limited':
        // Rate limit hit
        console.error('Rate limited, retry later');
        break;
      case 'unauthorized':
        // Invalid API key
        console.error('Check BREVO_API_KEY');
        break;
      case 'network_error':
      case 'timeout':
        // Transient errors (retries already attempted)
        console.error('Network issue');
        break;
    }
  }
}
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BREVO_API_KEY` | Yes | - | Brevo API key |
| `DEFAULT_FROM_EMAIL` | Yes | - | Default sender email |
| `DEFAULT_FROM_NAME` | Yes | - | Default sender name |
| `BREVO_BASE_URL` | No | `https://api.brevo.com/v3` | Brevo API base URL |
| `BREVO_TIMEOUT_MS` | No | `10000` | Request timeout in ms |
| `BREVO_RETRY_MAX_ATTEMPTS` | No | `3` | Max retry attempts |
| `BREVO_RETRY_BASE_DELAY_MS` | No | `200` | Base retry delay |
| `BREVO_RETRY_MAX_DELAY_MS` | No | `2000` | Max retry delay |
| `BREVO_TEMPLATE_EMAIL_VERIFICATION_ID` | No | - | Email verification template ID |
| `BREVO_TEMPLATE_PASSWORD_RESET_ID` | No | - | Password reset template ID |
| `FRONTEND_URL` | No | `http://localhost:3000` | Frontend base URL |

### Retry Logic

The module uses exponential backoff with the following behavior:

- **Retryable errors**: Network errors, timeouts, rate limits (429), server errors (5xx)
- **Non-retryable errors**: Bad requests (4xx), authentication errors (401), permission errors (403)
- **Delay calculation**: `min(baseDelay * 2^(attempt-1), maxDelay)`

Example retry sequence with defaults:
- Attempt 1: Immediate
- Attempt 2: 200ms delay
- Attempt 3: 400ms delay

## Testing

### Running Tests

```bash
# All email tests
npm run test -- src/common/email

# Specific test file
npm run test -- src/common/email/email.service.spec.ts

# With coverage
npm run test:cov -- src/common/email
```

### Unit Testing

```typescript
import { Test } from '@nestjs/testing';
import { EmailService } from './common/email';
import { EMAIL_CONFIG, EMAIL_PROVIDER } from './common/email/email.constants';

const mockProvider = {
  sendEmail: jest.fn().mockResolvedValue({
    provider: 'brevo',
    messageId: 'test-id',
  }),
};

const module = await Test.createTestingModule({
  providers: [
    EmailService,
    { provide: EMAIL_PROVIDER, useValue: mockProvider },
    { provide: EMAIL_CONFIG, useValue: mockConfig },
  ],
}).compile();

const emailService = module.get<EmailService>(EmailService);
```

## Security

### Input Validation

- ✅ Email address validation
- ✅ Header injection prevention
- ✅ Subject sanitization
- ✅ HTML escaping (by default)
- ✅ Template parameter validation

### XSS Prevention

By default, all template parameters are HTML-escaped:

```typescript
// Safe - HTML will be escaped
await emailService.sendTemplateEmail({
  to: 'user@example.com',
  templateId: 1,
  params: { content: '<script>alert("XSS")</script>' },
});
// Result: &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;
```

To allow HTML (use with caution):

```typescript
await emailService.sendTemplateEmail(
  { /* payload */ },
  { allowUnsafeHtml: true }
);
```

## Best Practices

### 1. Always Provide Plain Text Alternative

```typescript
await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Newsletter',
  html: '<h1>Newsletter</h1>',
  text: 'Newsletter', // Always include text version
});
```

### 2. Use Templates for Recurring Emails

Configure templates in Brevo dashboard for consistency and easy updates.

### 3. Queue Non-Critical Emails

For bulk or non-critical emails, use a queue (Bull, etc.) to avoid blocking.

### 4. Monitor Delivery

Track email delivery and errors in your monitoring system (Sentry, DataDog, etc.).

### 5. Validate Before Sending

```typescript
import { isEmail } from 'class-validator';

if (!isEmail(userEmail)) {
  throw new BadRequestException('Invalid email');
}
```

## Troubleshooting

### Email Not Sending

1. Verify `BREVO_API_KEY` in `.env`
2. Check application logs for error messages
3. Ensure recipient email is valid
4. Check Brevo dashboard for account status
5. Test API directly with curl

### Rate Limiting

If hitting rate limits:
1. Implement email queuing
2. Increase retry delays
3. Contact Brevo to increase limits
4. Use batch sending if available

### Template Not Found

1. Verify template ID in Brevo dashboard
2. Ensure `BREVO_TEMPLATE_*_ID` is set correctly
3. Check template is active in Brevo

## API Reference

See [EMAIL_USAGE.md](../../docs/EMAIL_USAGE.md) for complete API documentation.

## Contributing

When adding features:
1. Add types to `email.types.ts`
2. Update `EmailService` for new functionality
3. Add tests (maintain 100% coverage)
4. Update documentation
5. Run linter: `npm run lint`

## License

Part of the API Orientation project.
