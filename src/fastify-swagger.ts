import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSecureSwagger(app: any) {
    const port = Number(process.env.PORT ?? 3000);
    const title = process.env.APP_NAME ?? 'POPI 2.0 API';
    const description = "Documentation technique de l'API d'orientation";
    const version = process.env.APP_VERSION ?? '1.0.0';
    const swaggerPath = 'api/v1/docs';

    const serverUrls = (process.env.SWAGGER_SERVER_URLS ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter((value) => value.length > 0);

    const builder = new DocumentBuilder()
        .setTitle(title)
        .setDescription(description)
        .setVersion(version);

    const contactName = "Sèna Gédéon D'ALMEIDA";
    const contactUrl = '';
    const contactEmail = 'senadalmeidapro@gmail.com';
    if (contactName || contactUrl || contactEmail) {
        builder.setContact(contactName, contactUrl, contactEmail);
    }

    if (serverUrls.length > 0) {
        serverUrls.forEach((url) => builder.addServer(url));
    } else {
        builder.addServer(`http://localhost:${port}`, 'Serveur local');
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
