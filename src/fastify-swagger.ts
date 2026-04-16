import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from './common/config/config.service';

export function setupSecureSwagger(app: INestApplication) {
    const config = app.get(ConfigService);
    const title = config.app.name;
    const description = "Documentation technique de l'API d'orientation";
    const version = '';
    const swaggerPath = 'api/v1/docs';

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

    const contactName = '';
    const contactUrl = '';
    const contactEmail = '';
    if (contactName || contactUrl || contactEmail) {
        builder.setContact(contactName, contactUrl, contactEmail);
    }
    builder.addServer('/', 'Current host');

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
