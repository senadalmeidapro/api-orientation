import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { setupSecureSwagger } from './fastify-swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';
// import { ApiSuccessResponseInterceptor } from './common/interceptors/api-success-response.interceptor';
// import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { ConfigService } from './common/config/config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.enableCors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: config.cors.methods,
    allowedHeaders: config.cors.allowedHeaders,
    exposedHeaders: config.cors.exposedHeaders,
    maxAge: config.cors.maxAge,
    optionsSuccessStatus: config.cors.optionsSuccessStatus,
  });

  const isProduction = config.engine.nodeEnv === 'production';
  app.use(
    helmet({
      hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
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
  // app.useGlobalInterceptors(new ApiSuccessResponseInterceptor());
  // app.useGlobalFilters(new ApiExceptionFilter());
  await app.listen(process.env.PORT || 3000, config.app.host);
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
  logger.error(`Application failed to start: ${message}`);
  process.exit(1);
});
