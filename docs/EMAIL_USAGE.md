# Email Service - Usage Examples

This document provides comprehensive examples for using the EmailService and BrevoProvider in your NestJS application.

## Table of Contents

- [Setup](#setup)
- [Basic Usage](#basic-usage)
- [Advanced Usage](#advanced-usage)
- [Template Usage](#template-usage)
- [Error Handling](#error-handling)
- [Testing](#testing)

## Setup

### 1. Environment Configuration

Add the following variables to your `.env` file:

```env
# Brevo API Configuration
BREVO_API_KEY=your_brevo_api_key_here
BREVO_BASE_URL=https://api.brevo.com/v3
BREVO_TIMEOUT_MS=10000

# Retry Configuration (optional)
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

### 2. Module Import

Import the `EmailModule` in your application:

```typescript
import { Module } from '@nestjs/common';
import { EmailModule } from './common/email/email.module';

@Module({
  imports: [EmailModule],
})
export class AppModule {}
```

## Basic Usage

### Simple Email

Send a basic email with HTML content:

```typescript
import { Injectable } from '@nestjs/common';
import { EmailService } from './common/email/email.service';

@Injectable()
export class WelcomeService {
  constructor(private readonly emailService: EmailService) {}

  async sendWelcomeEmail(userEmail: string, userName: string) {
    await this.emailService.sendEmail({
      to: userEmail,
      subject: 'Welcome to Our Platform!',
      html: `
        <h1>Welcome, ${userName}!</h1>
        <p>Thank you for joining us.</p>
      `,
      text: `Welcome, ${userName}! Thank you for joining us.`,
    });
  }
}
```

### Multiple Recipients

Send email to multiple recipients:

```typescript
await this.emailService.sendEmail({
  to: ['user1@example.com', 'user2@example.com', 'user3@example.com'],
  subject: 'Team Update',
  html: '<p>Important team announcement...</p>',
});
```

### With Name Display

Include recipient names:

```typescript
await this.emailService.sendEmail({
  to: [
    { email: 'john@example.com', name: 'John Doe' },
    { email: 'jane@example.com', name: 'Jane Smith' },
  ],
  subject: 'Invitation',
  html: '<p>You are invited...</p>',
});
```

## Advanced Usage

### Custom From Address

Override the default sender:

```typescript
await this.emailService.sendEmail(
  {
    to: 'customer@example.com',
    subject: 'Support Response',
    html: '<p>Thank you for contacting support...</p>',
  },
  {
    from: {
      email: 'support@example.com',
      name: 'Customer Support',
    },
  },
);
```

### CC and BCC Recipients

```typescript
await this.emailService.sendEmail(
  {
    to: 'primary@example.com',
    subject: 'Project Update',
    html: '<p>Project status...</p>',
  },
  {
    cc: ['manager@example.com', 'team@example.com'],
    bcc: ['archive@example.com'],
  },
);
```

### Reply-To Address

```typescript
await this.emailService.sendEmail(
  {
    to: 'customer@example.com',
    subject: 'Newsletter',
    html: '<p>Latest news...</p>',
  },
  {
    replyTo: {
      email: 'hello@example.com',
      name: 'Contact Us',
    },
  },
);
```

### Custom Headers and Tags

```typescript
await this.emailService.sendEmail(
  {
    to: 'user@example.com',
    subject: 'Promotional Email',
    html: '<p>Special offer...</p>',
  },
  {
    headers: {
      'X-Campaign-ID': 'summer-2024',
      'X-Priority': 'high',
    },
    tags: ['promotional', 'summer-campaign', 'discount'],
  },
);
```

### Custom Retry Logic

```typescript
await this.emailService.sendEmail(
  {
    to: 'user@example.com',
    subject: 'Important Notification',
    html: '<p>Critical update...</p>',
  },
  {
    retry: {
      maxAttempts: 5,
      baseDelayMs: 500,
      maxDelayMs: 5000,
    },
    timeoutMs: 15000,
  },
);
```

## Template Usage

### Using Brevo Templates

Send email using a pre-configured Brevo template:

```typescript
await this.emailService.sendTemplateEmail({
  to: 'user@example.com',
  templateId: 1, // Configure in Brevo dashboard
  params: {
    firstName: 'John',
    verificationUrl: 'https://yourapp.com/verify?token=abc123',
    expiresIn: '24 hours',
  },
});
```

### Verification Email (Built-in)

Use the pre-configured verification email template:

```typescript
@Injectable()
export class AuthService {
  constructor(private readonly emailService: EmailService) {}

  async sendVerificationEmail(user: User, token: string) {
    await this.emailService.sendVerificationEmail({
      to: user.email,
      firstName: user.firstName,
      token: token,
      userId: user.id,
    });
  }
}
```

### Password Reset Email (Built-in)

Use the pre-configured password reset template:

```typescript
@Injectable()
export class AuthService {
  constructor(private readonly emailService: EmailService) {}

  async sendPasswordResetEmail(user: User, resetToken: string) {
    await this.emailService.sendPasswordResetEmail({
      to: user.email,
      firstName: user.firstName,
      token: resetToken,
      userId: user.id,
    });
  }
}
```

### String Template with Parameters

Use inline templates with parameter substitution:

```typescript
await this.emailService.sendEmailFromTemplate({
  to: 'user@example.com',
  subject: 'Order Confirmation - Order #{{orderNumber}}',
  htmlTemplate: `
    <h1>Thank you for your order, {{customerName}}!</h1>
    <p>Order Number: <strong>{{orderNumber}}</strong></p>
    <p>Total: ${{ total }}</p>
    <p>Expected delivery: {{deliveryDate}}</p>
  `,
  textTemplate: `
    Thank you for your order, {{customerName}}!
    Order Number: {{orderNumber}}
    Total: ${{ total }}
    Expected delivery: {{deliveryDate}}
  `,
  params: {
    customerName: 'John Doe',
    orderNumber: '12345',
    total: 99.99,
    deliveryDate: '2024-04-15',
  },
});
```

### Template with HTML (Unsafe)

If you need to include HTML in template parameters:

```typescript
await this.emailService.sendEmailFromTemplate(
  {
    to: 'user@example.com',
    subject: 'Weekly Digest',
    htmlTemplate: '<div>{{content}}</div>',
    params: {
      content: '<h2>Top Stories</h2><ul><li>Story 1</li><li>Story 2</li></ul>',
    },
  },
  {
    allowUnsafeHtml: true, // Disable HTML escaping
  },
);
```

## Error Handling

### Basic Error Handling

```typescript
import { EmailSendError } from './common/email/email.errors';

try {
  await this.emailService.sendEmail({
    to: 'user@example.com',
    subject: 'Test',
    html: '<p>Test</p>',
  });
} catch (error) {
  if (error instanceof EmailSendError) {
    console.error('Email send failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Retryable:', error.retryable);
  }
}
```

### Advanced Error Handling

```typescript
import { EmailSendError, EmailValidationError } from './common/email/email.errors';

try {
  await this.emailService.sendEmail(payload);
} catch (error) {
  if (error instanceof EmailValidationError) {
    // Invalid input (email format, missing fields, etc.)
    console.error('Validation error:', error.message);
    console.error('Field:', error.field);
    // Don't retry, fix the input
  } else if (error instanceof EmailSendError) {
    switch (error.code) {
      case 'rate_limited':
        // Rate limit hit, retry later
        console.error('Rate limited, retry after delay');
        break;
      case 'unauthorized':
        // Invalid API key
        console.error('Check your BREVO_API_KEY configuration');
        break;
      case 'network_error':
      case 'timeout':
        // Transient errors, retry automatically handled
        console.error('Network issue, retries exhausted');
        break;
      case 'provider_error':
        // Brevo service issue
        console.error('Provider error:', error.message);
        break;
      default:
        console.error('Unknown email error:', error.message);
    }
  }
}
```

### Graceful Degradation

```typescript
@Injectable()
export class NotificationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly logger: Logger,
  ) {}

  async notifyUser(userId: string, message: string) {
    try {
      await this.emailService.sendEmail({
        to: await this.getUserEmail(userId),
        subject: 'Notification',
        html: `<p>${message}</p>`,
      });
    } catch (error) {
      // Log error but don't fail the operation
      this.logger.error(`Failed to send email notification to user ${userId}`, error);

      // Fall back to in-app notification or other mechanism
      await this.sendInAppNotification(userId, message);
    }
  }
}
```

## Testing

### Unit Testing with Mocks

```typescript
import { Test } from '@nestjs/testing';
import { EmailService } from './common/email/email.service';
import { EMAIL_CONFIG, EMAIL_PROVIDER } from './common/email/email.constants';

describe('MyService', () => {
  let myService: MyService;
  let emailService: EmailService;

  beforeEach(async () => {
    const mockProvider = {
      sendEmail: jest.fn().mockResolvedValue({
        provider: 'brevo',
        messageId: 'test-msg-id',
      }),
      sendTemplateEmail: jest.fn().mockResolvedValue({
        provider: 'brevo',
        messageId: 'test-template-msg-id',
      }),
    };

    const mockConfig = {
      apiKey: 'test-key',
      baseUrl: 'https://api.brevo.com/v3',
      defaultFromEmail: 'test@example.com',
      defaultFromName: 'Test',
      timeoutMs: 10000,
      retry: { maxAttempts: 3, baseDelayMs: 200, maxDelayMs: 2000 },
      templates: { verificationId: 1, passwordResetId: 2 },
    };

    const module = await Test.createTestingModule({
      providers: [
        MyService,
        EmailService,
        { provide: EMAIL_PROVIDER, useValue: mockProvider },
        { provide: EMAIL_CONFIG, useValue: mockConfig },
      ],
    }).compile();

    myService = module.get<MyService>(MyService);
    emailService = module.get<EmailService>(EmailService);
  });

  it('should send welcome email', async () => {
    const sendEmailSpy = jest.spyOn(emailService, 'sendEmail');

    await myService.sendWelcome('user@example.com');

    expect(sendEmailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: expect.stringContaining('Welcome'),
      }),
    );
  });
});
```

### Integration Testing

```typescript
describe('EmailService Integration', () => {
  let emailService: EmailService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [EmailModule, ConfigModule.forRoot()],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
  });

  it('should send real email (requires valid API key)', async () => {
    const result = await emailService.sendEmail({
      to: 'test@example.com',
      subject: 'Integration Test',
      html: '<p>This is a test email</p>',
    });

    expect(result.provider).toBe('brevo');
    expect(result.messageId).toBeDefined();
  }, 15000); // Longer timeout for real API call
});
```

## Best Practices

### 1. Use Templates for Recurring Emails

Configure templates in Brevo dashboard for emails you send frequently (verification, password reset, notifications).

### 2. Always Provide Plain Text Alternative

```typescript
await this.emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Newsletter',
  html: '<h1>Newsletter</h1><p>Content...</p>',
  text: 'Newsletter\n\nContent...', // Plain text version
});
```

### 3. Validate Email Addresses Before Sending

```typescript
import { isEmail } from 'class-validator';

if (!isEmail(userEmail)) {
  throw new BadRequestException('Invalid email address');
}

await this.emailService.sendEmail({
  to: userEmail,
  subject: 'Welcome',
  html: '<p>Welcome!</p>',
});
```

### 4. Use Async Processing for Non-Critical Emails

```typescript
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EmailQueueService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async queueWelcomeEmail(userEmail: string) {
    await this.emailQueue.add('welcome', { email: userEmail });
  }
}
```

### 5. Monitor Email Delivery

```typescript
@Injectable()
export class EmailMonitoringService {
  constructor(
    private readonly emailService: EmailService,
    private readonly logger: Logger,
  ) {}

  async sendWithMonitoring(payload: any) {
    const startTime = Date.now();

    try {
      const result = await this.emailService.sendEmail(payload);
      const duration = Date.now() - startTime;

      this.logger.log(`Email sent in ${duration}ms - MessageId: ${result.messageId}`);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error(`Email failed after ${duration}ms`, error);

      // Send to monitoring service (Sentry, DataDog, etc.)
      // this.monitoringService.captureException(error);

      throw error;
    }
  }
}
```

## Troubleshooting

### Email Not Sending

1. **Check API Key**: Verify `BREVO_API_KEY` is correct
2. **Check Logs**: Look for error messages in application logs
3. **Verify Email Address**: Ensure recipient email is valid
4. **Check Rate Limits**: You might be hitting Brevo's rate limits
5. **Test Brevo API**: Use curl to test the API directly

```bash
curl -X POST 'https://api.brevo.com/v3/smtp/email' \
  -H 'api-key: YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "sender": {"email": "test@example.com"},
    "to": [{"email": "recipient@example.com"}],
    "subject": "Test",
    "htmlContent": "<p>Test</p>"
  }'
```

### Template Not Working

1. **Verify Template ID**: Check the ID in Brevo dashboard
2. **Check Parameters**: Ensure parameter names match template variables
3. **Review Template**: Test the template in Brevo dashboard

### Rate Limiting

If you're hitting rate limits:

1. Implement queuing for bulk emails
2. Increase retry delays
3. Contact Brevo to increase your limits
4. Use batch sending APIs if available

## Additional Resources

- [Brevo API Documentation](https://developers.brevo.com/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Email Best Practices](https://sendgrid.com/blog/email-best-practices/)
