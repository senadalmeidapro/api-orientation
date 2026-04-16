import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { setupSecureSwagger } from './fastify-swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ApiSuccessResponseInterceptor } from './common/interceptors/api-success-response.interceptor';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { ConfigService } from './common/config/config.service';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const config = app.get(ConfigService);

    // const trustProxyEnabled = parseBooleanEnv(process.env.TRUST_PROXY, false);
    // if (trustProxyEnabled) {
    //     app.set('trust proxy', 1);
    // }
    app.disable('x-powered-by');

    app.enableCors({
        origin: config.cors.origin,
        credentials: config.cors.credentials,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Authorization',
            'Content-Type',
            'Accept',
            'Origin',
            'X-Requested-With',
            'X-Device-Id',
            'X-Metrics-Token',
        ],
        exposedHeaders: ['Content-Disposition'],
        maxAge: 600,
        optionsSuccessStatus: 204,
    });

    const isProduction = config.engine.nodeEnv === 'production';
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
    await app.listen(config.app.port, config.app.host);
}

bootstrap();
