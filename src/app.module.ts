import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
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
import { ConfigModule } from './common/config/config.module';
import { ConfigService } from './common/config/config.service';

@Module({
    imports: [
        NestCacheModule.registerAsync({
            isGlobal: true,
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => {
                const redisUrl = config.redis.url;
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
        ConfigModule,
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
