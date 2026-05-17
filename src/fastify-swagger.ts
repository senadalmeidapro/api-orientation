import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@common/config/config.service';

export function setupSecureSwagger(app: INestApplication) {
  const config = app.get(ConfigService);
  const title = config.app.name;
  const description = "Documentation technique de l'API d'orientation";
  const version = '';

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

  builder.setContact(
    config.swagger.contact.name,
    config.swagger.contact.url,
    config.swagger.contact.email,
  );
  builder.addServer('/', 'Current host');
  builder.addServer(config.swagger.serverUrls, 'Production server');

  const swaggerDocument = SwaggerModule.createDocument(app, builder.build());

  SwaggerModule.setup(config.swagger.path, app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: false,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });
}
