# Email Service - Quick Reference

## 🚀 Quick Start

```typescript
// 1. Inject the service
constructor(private readonly emailService: EmailService) {}

// 2. Send email
await this.emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Hello',
  html: '<p>Hello World</p>',
});
```

## 📧 Common Use Cases

### Welcome Email

```typescript
await this.emailService.sendEmail({
  to: user.email,
  subject: 'Welcome to Our Platform!',
  html: `<h1>Welcome ${user.name}!</h1>`,
  text: `Welcome ${user.name}!`,
});
```

### Verification Email (Built-in)

```typescript
await this.emailService.sendVerificationEmail({
  to: user.email,
  firstName: user.firstName,
  token: verificationToken,
  userId: user.id,
});
```

### Password Reset (Built-in)

```typescript
await this.emailService.sendPasswordResetEmail({
  to: user.email,
  firstName: user.firstName,
  token: resetToken,
  userId: user.id,
});
```

### Notification Email

```typescript
await this.emailService.sendEmail({
  to: user.email,
  subject: 'New Message',
  html: `<p>You have a new message from ${sender}</p>`,
  text: `You have a new message from ${sender}`,
});
```

### Bulk Email

```typescript
await this.emailService.sendEmail({
  to: ['user1@example.com', 'user2@example.com', 'user3@example.com'],
  subject: 'Team Announcement',
  html: '<p>Important update...</p>',
});
```

### Template Email

```typescript
await this.emailService.sendTemplateEmail({
  to: user.email,
  templateId: 1,
  params: { name: user.name, date: new Date() },
});
```

### String Template

```typescript
await this.emailService.sendEmailFromTemplate({
  to: user.email,
  subject: 'Order #{{orderNumber}}',
  htmlTemplate: '<h1>Order #{{orderNumber}}</h1><p>Total: ${{total}}</p>',
  params: { orderNumber: '12345', total: 99.99 },
});
```

## 🔧 Advanced Options

### With CC/BCC

```typescript
await this.emailService.sendEmail(
  { to: 'user@example.com', subject: 'Test', html: '<p>Test</p>' },
  {
    cc: ['manager@example.com'],
    bcc: ['archive@example.com'],
  },
);
```

### Custom From

```typescript
await this.emailService.sendEmail(
  { to: 'user@example.com', subject: 'Support', html: '<p>Reply</p>' },
  { from: { email: 'support@example.com', name: 'Support Team' } },
);
```

### With Tags

```typescript
await this.emailService.sendEmail(
  { to: 'user@example.com', subject: 'Promo', html: '<p>Sale!</p>' },
  { tags: ['promotional', 'summer-sale'] },
);
```

### Custom Retry

```typescript
await this.emailService.sendEmail(
  { to: 'user@example.com', subject: 'Critical', html: '<p>Alert</p>' },
  {
    retry: { maxAttempts: 5, baseDelayMs: 500, maxDelayMs: 5000 },
    timeoutMs: 15000,
  },
);
```

## ⚠️ Error Handling

### Basic

```typescript
try {
  await this.emailService.sendEmail(payload);
} catch (error) {
  this.logger.error('Email failed', error);
}
```

### Advanced

```typescript
import { EmailSendError, EmailValidationError } from './common/email';

try {
  await this.emailService.sendEmail(payload);
} catch (error) {
  if (error instanceof EmailValidationError) {
    throw new BadRequestException(`Invalid ${error.field}`);
  }
  if (error instanceof EmailSendError) {
    if (error.retryable) {
      // Queue for later retry
    } else {
      // Log and alert
    }
  }
}
```

## 🔐 Security

### Safe (HTML Escaped)

```typescript
await this.emailService.sendTemplateEmail({
  to: 'user@example.com',
  templateId: 1,
  params: { content: '<script>alert("XSS")</script>' },
  // Result: &lt;script&gt;...
});
```

### Unsafe (Explicit)

```typescript
await this.emailService.sendTemplateEmail(
  { to: 'user@example.com', templateId: 1, params: { html: '<b>Bold</b>' } },
  { allowUnsafeHtml: true }, // Use with caution!
);
```

## 📊 Testing

### Mock Setup

```typescript
const mockProvider = {
  sendEmail: jest.fn().mockResolvedValue({ provider: 'brevo', messageId: 'test' }),
  sendTemplateEmail: jest.fn().mockResolvedValue({ provider: 'brevo', messageId: 'test' }),
};

const module = await Test.createTestingModule({
  providers: [
    EmailService,
    { provide: EMAIL_PROVIDER, useValue: mockProvider },
    { provide: EMAIL_CONFIG, useValue: mockConfig },
  ],
}).compile();
```

### Test Example

```typescript
it('should send email', async () => {
  const spy = jest.spyOn(emailService, 'sendEmail');

  await service.welcomeUser('user@example.com');

  expect(spy).toHaveBeenCalledWith(expect.objectContaining({ to: 'user@example.com' }));
});
```

## 🌐 Environment Variables

```env
# Required
BREVO_API_KEY=your_key
DEFAULT_FROM_EMAIL=noreply@example.com
DEFAULT_FROM_NAME=Your App

# Optional
BREVO_TIMEOUT_MS=10000
BREVO_RETRY_MAX_ATTEMPTS=3
BREVO_TEMPLATE_EMAIL_VERIFICATION_ID=1
BREVO_TEMPLATE_PASSWORD_RESET_ID=2
FRONTEND_URL=https://yourapp.com
```

## 📚 Documentation

- **Full Guide**: `docs/EMAIL_USAGE.md`
- **Module README**: `src/common/email/README.md`
- **Implementation Summary**: `docs/EMAIL_IMPLEMENTATION_SUMMARY.md`

## ✅ Checklist

- [ ] Set `BREVO_API_KEY` in `.env`
- [ ] Set `DEFAULT_FROM_EMAIL` in `.env`
- [ ] Set `DEFAULT_FROM_NAME` in `.env`
- [ ] Import `EmailModule` in your module
- [ ] Inject `EmailService` in your service
- [ ] Send your first email!

## 🆘 Troubleshooting

| Issue              | Solution                                 |
| ------------------ | ---------------------------------------- |
| Email not sending  | Check `BREVO_API_KEY`                    |
| Rate limit error   | Implement queuing                        |
| Invalid email      | Validate with `isEmail()` before sending |
| Template not found | Check template ID in Brevo dashboard     |
| Timeout            | Increase `BREVO_TIMEOUT_MS`              |

## 📞 Support

- Brevo Docs: https://developers.brevo.com/
- Module Tests: `npm run test -- src/common/email`
- Lint: `npm run lint`
