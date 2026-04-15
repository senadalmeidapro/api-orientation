import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { setupSecureSwagger } from './fastify-swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ApiSuccessResponseInterceptor } from './common/interceptors/api-success-response.interceptor';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';

const parseBooleanEnv = (value: string | undefined, defaultValue = false): boolean => {
    if (value === undefined) {
        return defaultValue;
    }

    return ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase());
};

const parseListEnv = (value: string | undefined): string[] =>
    (value ?? '')
        .split(',')
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const trustProxyEnabled = parseBooleanEnv(process.env.TRUST_PROXY, false);
    if (trustProxyEnabled) {
        app.set('trust proxy', 1);
    }
    app.disable('x-powered-by');

    const corsOrigins = parseListEnv(process.env.CORS_ORIGIN);
    const allowAllOrigins = corsOrigins.includes('*');
    const corsCredentials =
        parseBooleanEnv(process.env.CORS_CREDENTIALS, false) && !allowAllOrigins;
    const corsMethods = parseListEnv(process.env.CORS_METHODS);
    const corsAllowedHeaders = parseListEnv(process.env.CORS_ALLOWED_HEADERS);
    const corsExposedHeaders = parseListEnv(process.env.CORS_EXPOSED_HEADERS);
    const corsMaxAgeEnv = Number.parseInt(process.env.CORS_MAX_AGE ?? '600', 10);
    const corsMaxAge = Number.isFinite(corsMaxAgeEnv) && corsMaxAgeEnv >= 0 ? corsMaxAgeEnv : 600;

    app.enableCors({
        origin: allowAllOrigins ? true : corsOrigins.length > 0 ? corsOrigins : false,
        credentials: corsCredentials,
        methods:
            corsMethods.length > 0
                ? corsMethods
                : ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders:
            corsAllowedHeaders.length > 0
                ? corsAllowedHeaders
                : [
                      'Authorization',
                      'Content-Type',
                      'Accept',
                      'Origin',
                      'X-Requested-With',
                      'X-Device-Id',
                      'X-Metrics-Token',
                  ],
        exposedHeaders:
            corsExposedHeaders.length > 0 ? corsExposedHeaders : ['Content-Disposition'],
        maxAge: corsMaxAge,
        optionsSuccessStatus: 204,
    });

    const isProduction = process.env.NODE_ENV === 'production';
    app.use(
        helmet({
            hsts: isProduction
                ? { maxAge: 31536000, includeSubDomains: true, preload: true }
                : false,
            referrerPolicy: { policy: 'no-referrer' },
            dnsPrefetchControl: { allow: false },
            contentSecurityPolicy: {
                directives: {
                    ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                    'upgrade-insecure-requests': null,
                },
            },
        }),
    );
    // --- Swagger sécurisé ---
    setupSecureSwagger(app);
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );
    app.useGlobalInterceptors(new ApiSuccessResponseInterceptor());
    app.useGlobalFilters(new ApiExceptionFilter());
    await app.listen(process.env.PORT ?? 3000, '10.48.73.80');
    // await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
