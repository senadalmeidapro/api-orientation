import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { ResponsesModule } from './modules/responses/responses.module';
import { ScoringModule } from './modules/scoring/scoring.module';
import { ResultsModule } from './modules/results/results.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { AiModule } from './modules/ai/ai.module';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';
import { HealthController } from './health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AssessmentsModule } from './modules/assessments/assessments.module';
import { CareersModule } from './modules/careers/careers.module';
import { TrainingCentersModule } from './modules/training-centers/training-centers.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { LinksModule } from './modules/links/links.module';
import { TrainingPathsModule } from './modules/training-paths/training-paths.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { EmailModule } from './common/email/email.module';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { AppCacheModule } from './common/cache/cache.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // Rend le module disponible partout sans l'importer
            envFilePath: '.env', // Chemin vers votre fichier .env (par défaut c'est '.env')
            cache: true, // Met en cache les variables pour de meilleures performances
        }),
        NestCacheModule.registerAsync({
            isGlobal: true,
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => {
                const redisUrl = config.get('REDIS_URL') || 'redis://localhost:6379';
                return {
                    stores: [createKeyv(redisUrl)],
                    ttl: 0,
                };
            },
            inject: [ConfigService],
        }),
        ThrottlerModule.forRoot([
            {
                ttl: 60,
                limit: 120,
            },
        ]),
        PrismaModule,
        SessionsModule,
        QuestionsModule,
        ResponsesModule,
        ScoringModule,
        ResultsModule,
        RecommendationsModule,
        AiModule,
        AuthModule,
        UsersModule,
        AssessmentsModule,
        CareersModule,
        TrainingCentersModule,
        ResourcesModule,
        LinksModule,
        TrainingPathsModule,
        AnalyticsModule,
        EmailModule,
        AppCacheModule,
    ],
    controllers: [HealthController],
    providers: [
        { provide: APP_GUARD, useClass: ThrottlerBehindProxyGuard },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
    ],
})
export class AppModule {}
