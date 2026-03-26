import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { setupSecureSwagger } from './fastify-swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // app.set('trust proxy', 1);
    const corsCredentials = process.env.CORS_CREDENTIALS === 'true';
    if (process.env.CORS_ORIGIN) {
        const origins = process.env.CORS_ORIGIN.split(',').map((o) => o.trim());
        const allowAll = origins.includes('*');
        app.enableCors({
            origin: allowAll ? true : origins,
            credentials: corsCredentials,
        });
    } else {
        app.enableCors({
            origin: true,
            credentials: corsCredentials,
        });
    }
    app.use(helmet());
    // --- Swagger sécurisé ---
    await setupSecureSwagger(app);
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );
    await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
