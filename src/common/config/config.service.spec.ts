import { Test, type TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';
import { Logger } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('ConfigService', () => {
    let service: ConfigService;
    const originalEnv = { ...process.env };

    // Un mock des variables obligatoires pour éviter que le constructeur ne crash
    const minimalEnv = {
        APP_NAME: 'TestApp',
        APP_BACK_NAME: 'TestBack',
        SUPPORT_EMAIL: 'support@test.com',
        APP_URL: 'http://localhost',
        CORS_ORIGIN: '*',
        FRONT_URL: 'http://localhost:3000',
        SECURE_SESSION_KEY: 'secret',
        CONTENT_SECURITY_POLICY: 'default-src self',
        SENTRY_DSN: 'https://sentry.io',
        NODE_VERSION: '20',
        NPM_VERSION: '10',
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        DB_HOST: 'localhost',
        DB_USER: 'user',
        DB_PASSWORD: 'password',
        DB_NAME: 'db',
        JWT_SECRET: 'jwt-secret',
        JWT_REFRESH_SECRET: 'refresh-secret',
        JWT_ISSUER: 'issuer',
        EMAIL_HOST: 'smtp.test.com',
        EMAIL_USER: 'user',
        EMAIL_PASSWORD: 'password',
        EMAIL_FROM: 'no-reply@test.com',
        EMAIL_TEMPLATE_PATH: './templates',
        CLOUDINARY_URL: 'cloudinary://...',
        CLOUDINARY_CLOUD_NAME: 'name',
        CLOUDINARY_API_KEY: 'key',
        CLOUDINARY_API_SECRET: 'secret',
        STRIPE_SECRET_KEY: 'sk_test',
        STRIPE_PUBLIC_KEY: 'pk_test',
        STRIPE_API_VERSION: '2023-10-16',
        PAYMENT_SUCCESS_URL: 'http://success',
        PAYMENT_CANCEL_URL: 'http://cancel',
        PAYMENT_WEBHOOK_URL: 'http://webhook',
        PUPPETEER_EXECUTABLE_PATH: '/usr/bin/chrome',
    };

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...minimalEnv }; // On part d'un env propre et valide
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

    describe('Initialization & Validation', () => {
        it('should be defined with valid environment', async () => {
            service = await createService();
            expect(service).toBeDefined();
            expect(service.app.name).toBe('TestApp');
            expect(service.app.backendName).toBe('TestBack');
            expect(service.app.supportEmail).toBe('support@test.com');
            expect(service.app.env).toBe('development');
            expect(service.app.port).toBe(3000);
            expect(service.app.url).toBe('http://localhost');
            expect(service.app.debug).toBe(false);
            expect(service.security.corsOrigin).toBe('*');
            expect(service.security.frontUrl).toBe('http://localhost:3000');
            expect(service.security.sessionKey).toBe('secret');
            expect(service.security.rateLimit.windowMs).toBe(60000);
            expect(service.security.rateLimit.max).toBe(100);
            expect(service.security.csrfEnabled).toBe(true);
            expect(service.security.contentSecurityPolicy).toBe('default-src self');
            expect(service.logging.level).toBe('info');
            expect(service.logging.sentryDsn).toBe('https://sentry.io');
            expect(service.logging.loggerLevel).toBe('info');
            expect(service.logging.prettyPrint).toBe(true);
            expect(service.logging.winston.maxFileSizeMb).toBe(10);
            expect(service.logging.winston.maxFiles).toBe(30);
            expect(service.engine.nodeEnv).toBe('development');
            expect(service.engine.nodeVersion).toBe('20');
            expect(service.engine.npmVersion).toBe('10');
            expect(service.database.url).toBe('postgresql://user:pass@localhost:5432/db');
            expect(service.database.client).toBe('postgresql');
            expect(service.database.host).toBe('localhost');
            expect(service.database.port).toBe(5432);
            expect(service.database.user).toBe('user');
            expect(service.database.password).toBe('password');
            expect(service.database.name).toBe('db');
            expect(service.database.schema).toBe('public');
            expect(service.database.ssl).toBe(false);
            expect(service.database.connectionTimeout).toBe(5000);
            expect(service.database.idleTimeout).toBe(10000);
            expect(service.tenant.header).toBe('x-tenant-id');
            expect(service.tenant.defaultTenant).toBe('default');
            expect(service.tenant.schemas).toEqual([]);
            expect(service.jwt.secret).toBe('jwt-secret');
            expect(service.jwt.expiresIn).toBe(3600);
            expect(service.jwt.refreshSecret).toBe('refresh-secret');
            expect(service.jwt.refreshExpiresIn).toBe(604800);
            expect(service.jwt.issuer).toBe('issuer');
            expect(service.oauth.google.clientId).toBe('');
            expect(service.oauth.google.clientSecret).toBe('');
            expect(service.oauth.google.callbackUrl).toBe('');
            expect(service.oauth.github.clientId).toBe('');
            expect(service.oauth.github.clientSecret).toBe('');
            expect(service.oauth.github.callbackUrl).toBe('');
            expect(service.email.host).toBe('smtp.test.com');
            expect(service.email.port).toBe(587);
            expect(service.email.useTLS).toBe(true);
            expect(service.email.secure).toBe(false);
            expect(service.email.user).toBe('user');
            expect(service.email.password).toBe('password');
            expect(service.email.from).toBe('no-reply@test.com');
            expect(service.email.templatePath).toBe('./templates');
            expect(service.email.defaultLanguage).toBe('fr');
        });

        it('should throw an error if a mandatory string is missing', async () => {
            delete process.env.APP_NAME;
            // On s'attend à ce que l'instanciation échoue
            await expect(createService()).rejects.toThrow(/Missing env var: APP_NAME/);
        });
    });

    describe('Data Parsing', () => {
        it('should correctly parse boolean values (true cases)', async () => {
            process.env.APP_DEBUG = 'true';
            process.env.CSRF_ENABLED = '1';
            service = await createService();
            expect(service.app.debug).toBe(true);
            expect(service.security.csrfEnabled).toBe(true);
        });

        it('should use default value for missing optional boolean', async () => {
            delete process.env.ENABLE_BETA_FEATURES;
            service = await createService();
            expect(service.features.beta).toBe(false); // def = false dans le code
        });

        it('should correctly parse numeric values', async () => {
            process.env.APP_PORT = '5000';
            service = await createService();
            expect(service.app.port).toBe(5000);
            expect(typeof service.app.port).toBe('number');
        });

        it('should throw if a numeric variable is not a valid number', async () => {
            process.env.APP_PORT = 'invalid';
            await expect(createService()).rejects.toThrow(/Invalid number for APP_PORT/);
        });

        it('should correctly parse list values', async () => {
            process.env.TENANT_SCHEMAS = 'auth, public, tenant1';
            service = await createService();
            expect(service.tenant.schemas).toEqual(['auth', 'public', 'tenant1']);
        });
    });

    describe('Configuration Grouping', () => {
        it('should correctly load nested oauth configuration', async () => {
            process.env.GOOGLE_CLIENT_ID = 'google-id';
            service = await createService();
            expect(service.oauth.google.clientId).toBe('google-id');
        });

        it('should correctly load database config', async () => {
            process.env.DB_PORT = '5433';
            service = await createService();
            expect(service.database.port).toBe(5433);
        });
    });
});
