import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSecureSwagger(app: any) {
    const PORT = process.env.APP_PORT ?? 3000;

    const swaggerConfig = new DocumentBuilder()
        .setTitle('ECOSYT API')
        .setDescription('Documentation technique du projet ECOSYT')
        .setVersion('1.0.0')
        .addServer(`http://localhost:${PORT}`, 'Serveur local')
        .addServer('https://api.ecosyt.com', 'Serveur distant')
        .setContact('Sèna D’ALMEIDA', 'https://ecosyt.com', 'senadalmeidapro@gmail.com')
        .build();

    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('api/v1/docs/v1', app, swaggerDocument, {
        swaggerOptions: {
            persistAuthorization: false,
            docExpansion: 'none',
            filter: true,
            showRequestDuration: true,
        },
    });
}
