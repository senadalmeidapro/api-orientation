import { Test, type TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';
import { Logger } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('ConfigService', () => {
  let service: ConfigService;
  const originalEnv = { ...process.env };

  const minimalEnv: Record<string, string> = {
    // Engine
    NODE_ENV: 'test',
    NODE_VERSION: '20',
    NPM_VERSION: '10',
    // App
    APP_NAME: 'TestApp',
    APP_ENV: 'test',
    APP_VERSION: '1.0.0',
    APP_DESCRIPTION: 'Test API',
    APP_URL: 'http://localhost:3000',
    BACK_URL: 'http://localhost:3000',
    FRONT_URL: 'http://localhost:5173',
    APP_LOCAL: 'fr',
    APP_FAKER_LOCAL: 'fr',
    APP_FALLBACK_LOCAL: 'fr',
    SUPPORT_EMAIL: 'support@test.com',
    FRONTEND_URL: 'http://localhost:5173',
    // CORS / session
    RATE_LIMIT_WINDOW_MS: '60000',
    RATE_LIMIT_MAX: '100',
    SECURE_SESSION_KEY: 'test-session-key',
    // Admin
    ADMIN_EMAIL: 'admin@test.com',
    ADMIN_KEY: 'admin-key',
    // Database
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    // Redis
    REDIS_URL: 'redis://localhost:6379',
    // JWT
    JWT_ACCESS_SECRET: 'access-secret',
    JWT_ACCESS_EXPIRES_IN: '900',
    JWT_REFRESH_SECRET: 'refresh-secret',
    JWT_REFRESH_EXPIRES_IN: '604800',
    JWT_SALT_ROUNDS: '10',
    JWT_ISSUER: 'api-orientation',
    JWT_AUDIENCE: 'api-orientation',
    // OAuth
    GOOGLE_CLIENT_ID: 'google-client-id',
    GOOGLE_CLIENT_SECRET: 'google-client-secret',
    GOOGLE_CALLBACK_URL: 'http://localhost:3000/auth/google/callback',
    // Email / Brevo
    EMAIL_HOST: 'smtp.test.com',
    EMAIL_PORT: '587',
    EMAIL_USER: 'user@test.com',
    EMAIL_PASSWORD: 'email-password',
    EMAIL_FROM_ADDRESS: 'noreply@test.com',
    EMAIL_FROM_NAME: 'Test App',
    EMAIL_TEMPLATE_PATH: 'templates/email',
    EMAIL_DEFAULT_LANGUAGE: 'fr',
    EMAIL_CONNECTION_TIMEOUT: '10000',
    EMAIL_GREETING_TIMEOUT: '10000',
    EMAIL_SOCKET_TIMEOUT: '10000',
    BREVO_API_KEY: 'brevo-api-key',
    BREVO_BASE_URL: 'https://api.brevo.com/v3',
    BREVO_TIMEOUT_MS: '10000',
    BREVO_RETRY_MAX_ATTEMPTS: '3',
    BREVO_RETRY_BASE_DELAY_MS: '200',
    BREVO_RETRY_MAX_DELAY_MS: '2000',
    // AI
    AI_TEMPERATURE: '0.3',
    AI_TIMEOUT_MS: '15000',
    GOOGLE_AI_API_KEY: 'google-ai-key',
    GOOGLE_AI_MODEL: 'gemini-2.0-flash',
    OPENAI_API_KEY: 'openai-key',
    OPENAI_MODEL: 'gpt-4o',
    OPENAI_BASE_URL: 'https://api.openai.com',
    // Payment
    STRIPE_SECRET_KEY: 'sk_test',
    STRIPE_PUBLIC_KEY: 'pk_test',
    STRIPE_WEBHOOK_SECRET: 'stripe-webhook-secret',
    STRIPE_API_VERSION: '2024-06-20',
    FEDAPAY_API_KEY: 'fedapay-key',
    FEDAPAY_PUBLIC_KEY: 'fedapay-public-key',
    FEDAPAY_ENVIRONMENT: 'sandbox',
    FEDAPAY_WEBHOOK_TOKEN: 'fedapay-webhook-token',
    FEDAPAY_MERCHANT_NAME: 'Test Merchant',
    FEDAPAY_MERCHANT_EMAIL: 'merchant@test.com',
    FEDAPAY_MERCHANT_PHONE: '+22900000000',
    PAYMENT_SUCCESS_URL: 'http://localhost/payment/success',
    PAYMENT_CANCEL_URL: 'http://localhost/payment/cancel',
    PAYMENT_WEBHOOK_URL: 'http://localhost/api/v1/payments/webhook',
    // PDF
    PUPPETEER_EXECUTABLE_PATH: '/usr/bin/google-chrome',
    PDF_TEMP_DIR: '/tmp',
    PDF_PAGE_SIZE: 'A4',
    PDF_MARGIN: '10',
    // Cloudinary
    CLOUDINARY_CLOUD_NAME: 'test-cloud',
    CLOUDINARY_API_KEY: 'cloudinary-key',
    CLOUDINARY_API_SECRET: 'cloudinary-secret',
    CLOUDINARY_URL: 'cloudinary://key:secret@test-cloud',
    // Swagger
    SWAGGER_SERVER_URLS: 'http://localhost:3000',
    SWAGGER_CONTACT_NAME: 'API Team',
    SWAGGER_CONTACT_EMAIL: 'support@test.com',
    SWAGGER_CONTACT_URL: 'https://test.com',
  };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...minimalEnv };
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  const createService = async (): Promise<ConfigService> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService],
    }).compile();
    return module.get<ConfigService>(ConfigService);
  };

  /* ─────────────────────────────────────────
   * Initialisation
   * ───────────────────────────────────────── */
  describe('Initialization & Validation', () => {
    it('should be defined with a valid environment', async () => {
      service = await createService();
      expect(service).toBeDefined();
    });

    it('should throw if a mandatory string var is missing', async () => {
      delete process.env.APP_NAME;
      await expect(createService()).rejects.toThrow(/Missing env var: APP_NAME/);
    });

    it('should throw if a mandatory numeric var is missing', async () => {
      delete process.env.JWT_ACCESS_EXPIRES_IN;
      await expect(createService()).rejects.toThrow(/Invalid number for JWT_ACCESS_EXPIRES_IN/);
    });
  });

  /* ─────────────────────────────────────────
   * Engine
   * ───────────────────────────────────────── */
  describe('engine', () => {
    it('should load engine vars', async () => {
      service = await createService();
      expect(service.engine.nodeEnv).toBe('test');
      expect(service.engine.nodeVersion).toBe('20');
      expect(service.engine.npmVersion).toBe('10');
    });
  });

  /* ─────────────────────────────────────────
   * App
   * ───────────────────────────────────────── */
  describe('app', () => {
    it('should load core app properties', async () => {
      service = await createService();
      expect(service.app.name).toBe('TestApp');
      expect(service.app.env).toBe('test');
      expect(service.app.version).toBe('1.0.0');
      expect(service.app.port).toBe(3000); // default
      expect(service.app.host).toBe('0.0.0.0'); // default
      expect(service.app.url).toBe('http://localhost:3000');
      expect(service.app.frontendUrl).toBe('http://localhost:5173');
      expect(service.app.debug).toBe(false);
      expect(service.app.supportEmail).toBe('support@test.com');
      expect(service.app.logLevel).toBe('info'); // default
    });

    it('should override APP_PORT when set', async () => {
      process.env.APP_PORT = '8080';
      service = await createService();
      expect(service.app.port).toBe(8080);
    });
  });

  /* ─────────────────────────────────────────
   * CORS
   * ───────────────────────────────────────── */
  describe('cors', () => {
    it('should load CORS defaults', async () => {
      service = await createService();
      expect(service.cors.maxAge).toBe(600);
      expect(service.cors.credentials).toBe(false);
      expect(service.cors.csrfEnabled).toBe(false);
      expect(service.cors.sessionKey).toBe('test-session-key');
      expect(service.cors.rateLimit.windowMs).toBe(60000);
      expect(service.cors.rateLimit.max).toBe(100);
    });

    it('should parse CORS_ORIGIN as a list', async () => {
      process.env.CORS_ORIGIN = 'http://localhost:5173,http://localhost:5175';
      service = await createService();
      expect(service.cors.origin).toEqual(['http://localhost:5173', 'http://localhost:5175']);
    });

    it('should return default CORS methods when not set', async () => {
      service = await createService();
      expect(service.cors.methods).toContain('GET');
      expect(service.cors.methods).toContain('POST');
    });
  });

  /* ─────────────────────────────────────────
   * Admin
   * ───────────────────────────────────────── */
  describe('admin', () => {
    it('should load admin credentials', async () => {
      service = await createService();
      expect(service.admin.email).toBe('admin@test.com');
      expect(service.admin.key).toBe('admin-key');
    });
  });

  /* ─────────────────────────────────────────
   * Database
   * ───────────────────────────────────────── */
  describe('database', () => {
    it('should load DATABASE_URL', async () => {
      service = await createService();
      expect(service.database.url).toBe('postgresql://user:pass@localhost:5432/db');
    });

    it('should throw if DATABASE_URL is missing', async () => {
      delete process.env.DATABASE_URL;
      await expect(createService()).rejects.toThrow(/Missing env var: DATABASE_URL/);
    });
  });

  /* ─────────────────────────────────────────
   * Redis
   * ───────────────────────────────────────── */
  describe('redis', () => {
    it('should load REDIS_URL', async () => {
      service = await createService();
      expect(service.redis.url).toBe('redis://localhost:6379');
    });
  });

  /* ─────────────────────────────────────────
   * JWT
   * ───────────────────────────────────────── */
  describe('jwt', () => {
    it('should load JWT config', async () => {
      service = await createService();
      expect(service.jwt.accessSecret).toBe('access-secret');
      expect(service.jwt.accessExpiresIn).toBe(900);
      expect(service.jwt.refreshSecret).toBe('refresh-secret');
      expect(service.jwt.refreshExpiresIn).toBe(604800);
      expect(service.jwt.saltRounds).toBe(10);
      expect(service.jwt.issuer).toBe('api-orientation');
      expect(service.jwt.audience).toBe('api-orientation');
    });
  });

  /* ─────────────────────────────────────────
   * OAuth
   * ───────────────────────────────────────── */
  describe('oauth', () => {
    it('should load Google OAuth config', async () => {
      service = await createService();
      expect(service.oauth.google.clientId).toBe('google-client-id');
      expect(service.oauth.google.clientSecret).toBe('google-client-secret');
      expect(service.oauth.google.callbackUrl).toBe('http://localhost:3000/auth/google/callback');
    });
  });

  /* ─────────────────────────────────────────
   * Email
   * ───────────────────────────────────────── */
  describe('email', () => {
    it('should load SMTP config', async () => {
      service = await createService();
      expect(service.email.host).toBe('smtp.test.com');
      expect(service.email.port).toBe(587);
      expect(service.email.user).toBe('user@test.com');
      expect(service.email.password).toBe('email-password');
      expect(service.email.secure).toBe(false);
      expect(service.email.useTLS).toBe(false);
      expect(service.email.fromAddress).toBe('noreply@test.com');
      expect(service.email.fromName).toBe('Test App');
      expect(service.email.templatePath).toBe('templates/email');
      expect(service.email.defaultLanguage).toBe('fr');
    });

    it('should build the "from" getter correctly', async () => {
      service = await createService();
      expect(service.email.from).toBe('Test App <noreply@test.com>');
    });

    it('should load Brevo config', async () => {
      service = await createService();
      expect(service.email.brevo.apiKey).toBe('brevo-api-key');
      expect(service.email.brevo.baseUrl).toBe('https://api.brevo.com/v3');
      expect(service.email.brevo.timeoutMs).toBe(10000);
      expect(service.email.brevo.retryMaxAttempts).toBe(3);
    });
  });

  /* ─────────────────────────────────────────
   * AI
   * ───────────────────────────────────────── */
  describe('ai', () => {
    it('should default provider to "google"', async () => {
      service = await createService();
      expect(service.ai.provider).toBe('google'); // default
    });

    it('should override AI_PROVIDER when set', async () => {
      process.env.AI_PROVIDER = 'openai';
      service = await createService();
      expect(service.ai.provider).toBe('openai');
    });

    it('should load Google AI config', async () => {
      service = await createService();
      expect(service.ai.google.apiKey).toBe('google-ai-key');
      expect(service.ai.google.model).toBe('gemini-2.0-flash');
    });

    it('should load OpenAI config', async () => {
      service = await createService();
      expect(service.ai.openai.apiKey).toBe('openai-key');
      expect(service.ai.openai.model).toBe('gpt-4o');
      expect(service.ai.openai.baseUrl).toBe('https://api.openai.com');
    });
  });

  /* ─────────────────────────────────────────
   * Payment
   * ───────────────────────────────────────── */
  describe('payment', () => {
    it('should load Stripe config', async () => {
      service = await createService();
      expect(service.payment.stripe.secretKey).toBe('sk_test');
      expect(service.payment.stripe.publicKey).toBe('pk_test');
      expect(service.payment.stripe.apiVersion).toBe('2024-06-20');
    });

    it('should load FedaPay config', async () => {
      service = await createService();
      expect(service.payment.fedapay.environment).toBe('sandbox');
      expect(service.payment.fedapay.merchant.phone).toBe('+22900000000');
    });

    it('should load payment URLs', async () => {
      service = await createService();
      expect(service.payment.urls.success).toBe('http://localhost/payment/success');
      expect(service.payment.urls.cancel).toBe('http://localhost/payment/cancel');
      expect(service.payment.urls.webhook).toBe('http://localhost/api/v1/payments/webhook');
    });
  });

  /* ─────────────────────────────────────────
   * PDF
   * ───────────────────────────────────────── */
  describe('pdf', () => {
    it('should load PDF / Puppeteer config', async () => {
      service = await createService();
      expect(service.pdf.executablePath).toBe('/usr/bin/google-chrome');
      expect(service.pdf.tempDir).toBe('/tmp');
      expect(service.pdf.pageSize).toBe('A4');
      expect(service.pdf.margin).toBe(10);
    });
  });

  /* ─────────────────────────────────────────
   * Cloudinary
   * ───────────────────────────────────────── */
  describe('cloudinary', () => {
    it('should load Cloudinary config', async () => {
      service = await createService();
      expect(service.cloudinary.cloudName).toBe('test-cloud');
      expect(service.cloudinary.apiKey).toBe('cloudinary-key');
      expect(service.cloudinary.apiSecret).toBe('cloudinary-secret');
      expect(service.cloudinary.secure).toBe(true); // default
      expect(service.cloudinary.optimize).toBe(false); // default
    });
  });

  /* ─────────────────────────────────────────
   * Storage
   * ───────────────────────────────────────── */
  describe('storage', () => {
    it('should use defaults when UPLOAD_DIR and MAX_FILE_SIZE_MB are missing', async () => {
      service = await createService();
      expect(service.storage.uploadDir).toBe('storage');
      expect(service.storage.maxFileSizeMb).toBe(20);
    });

    it('should override storage defaults when set', async () => {
      process.env.UPLOAD_DIR = 'uploads';
      process.env.MAX_FILE_SIZE_MB = '50';
      service = await createService();
      expect(service.storage.uploadDir).toBe('uploads');
      expect(service.storage.maxFileSizeMb).toBe(50);
    });
  });

  /* ─────────────────────────────────────────
   * S3 (optionnel)
   * ───────────────────────────────────────── */
  describe('s3', () => {
    it('should report configured=false when S3 vars are absent', async () => {
      service = await createService();
      expect(service.s3.configured).toBe(false);
      expect(service.s3.bucket).toBeUndefined();
    });

    it('should report configured=true when all required S3 vars are set', async () => {
      process.env.S3_ACCESS_KEY_ID = 'AKIA_TEST';
      process.env.S3_SECRET_ACCESS_KEY = 's3-secret';
      process.env.S3_BUCKET = 'my-bucket';
      process.env.S3_REGION = 'eu-west-1';
      service = await createService();
      expect(service.s3.configured).toBe(true);
      expect(service.s3.bucket).toBe('my-bucket');
      expect(service.s3.region).toBe('eu-west-1');
    });
  });

  /* ─────────────────────────────────────────
   * Swagger
   * ───────────────────────────────────────── */
  describe('swagger', () => {
    it('should load Swagger config', async () => {
      service = await createService();
      expect(service.swagger.path).toBe('api/v1/docs'); // default
      expect(service.swagger.serverUrls).toBe('http://localhost:3000');
      expect(service.swagger.contact.name).toBe('API Team');
      expect(service.swagger.contact.email).toBe('support@test.com');
    });

    it('should override SWAGGER_PATH when set', async () => {
      process.env.SWAGGER_PATH = 'docs';
      service = await createService();
      expect(service.swagger.path).toBe('docs');
    });
  });

  /* ─────────────────────────────────────────
   * Parsing helpers
   * ───────────────────────────────────────── */
  describe('Data Parsing', () => {
    it('should parse boolean "true" / "1" correctly', async () => {
      process.env.APP_DEBUG = 'true';
      process.env.CSRF_ENABLED = '1';
      service = await createService();
      expect(service.app.debug).toBe(true);
      expect(service.cors.csrfEnabled).toBe(true);
    });

    it('should return false for an absent boolean (default)', async () => {
      service = await createService();
      expect(service.app.debug).toBe(false);
      expect(service.cors.csrfEnabled).toBe(false);
    });

    it('should throw for an invalid numeric value', async () => {
      process.env.APP_PORT = 'not-a-number';
      await expect(createService()).rejects.toThrow(/Invalid number for APP_PORT/);
    });

    it('should trim and filter list values', async () => {
      process.env.CORS_ORIGIN = ' http://a.com , http://b.com , ';
      service = await createService();
      expect(service.cors.origin).toEqual(['http://a.com', 'http://b.com']);
    });
  });
});
