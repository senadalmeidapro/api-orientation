import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const parseListEnv = (value: string | undefined): string[] =>
    (value ?? '')
        .split(',')
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);

export function setupSecureSwagger(app: INestApplication) {
    const title = process.env.APP_NAME ?? 'POPI 2.0 API';
    const description =
        process.env.APP_DESCRIPTION ?? "Documentation technique de l'API d'orientation";
    const version = process.env.APP_VERSION ?? '1.0.0';
    const swaggerPath = (process.env.SWAGGER_PATH ?? 'api/v1/docs').trim() || 'api/v1/docs';
    const serverUrls = parseListEnv(process.env.SWAGGER_SERVER_URLS);

    const builder = new DocumentBuilder()
        .setTitle(title)
        .setDescription(description)
        .setVersion(version)
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Token JWT dans le header Authorization: Bearer <token>',
            },
            'access-token',
        );

    const contactName = (process.env.SWAGGER_CONTACT_NAME ?? '').trim();
    const contactUrl = (process.env.SWAGGER_CONTACT_URL ?? '').trim();
    const contactEmail = (process.env.SWAGGER_CONTACT_EMAIL ?? '').trim();
    if (contactName || contactUrl || contactEmail) {
        builder.setContact(contactName, contactUrl, contactEmail);
    }

    if (serverUrls.length > 0) {
        serverUrls.forEach((url) => builder.addServer(url));
    } else {
        builder.addServer('/', 'Current host');
    }

    const swaggerDocument = SwaggerModule.createDocument(app, builder.build());

    SwaggerModule.setup(swaggerPath, app, swaggerDocument, {
        swaggerOptions: {
            persistAuthorization: false,
            docExpansion: 'none',
            filter: true,
            showRequestDuration: true,
        },
    });
}
