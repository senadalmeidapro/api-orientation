import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

@Global()
@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: true, // Rend le module disponible partout sans l'importer
            envFilePath: '.env', // Chemin vers votre fichier .env (par défaut c'est '.env')
            cache: true, // Met en cache les variables pour de meilleures performances
        }),
    ],
    providers: [ConfigService],
    exports: [ConfigService],
})
export class ConfigModule {}
