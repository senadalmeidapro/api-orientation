import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

import { ConfigModule } from '@common/config/config.module';
import { ConfigService } from '@common/config/config.service';

import { PrismaModule } from './prisma/prisma.module';

import { AppCacheModule } from '@common/cache/cache.module';
import { EmailModule } from '@common/email/email.module';
import { JwtAuthGuard } from '@modules/auth/guards/jwt.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { ThrottlerBehindProxyGuard } from '@common/guards/throttler-behind-proxy.guard';

import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { SessionsModule } from '@modules/sessions/sessions.module';
import { QuestionsModule } from '@modules/questions/questions.module';
import { ResponsesModule } from '@modules/responses/responses.module';
import { ScoringModule } from '@modules/scoring/scoring.module';
import { ResultsModule } from '@modules/results/results.module';
import { RecommendationsModule } from '@modules/recommendations/recommendations.module';
import { AssessmentsModule } from '@modules/assessments/assessments.module';
import { CareersModule } from '@modules/careers/careers.module';
import { UniversitiesModule } from '@modules/universities/universities.module';
import { ResourcesModule } from '@modules/resources/resources.module';
import { AnalyticsModule } from '@modules/analytics/analytics.module';
import { AiModule } from '@modules/ai/ai.module';

import { HealthController } from './health.controller';

@Module({
    imports: [
        ConfigModule,

        NestCacheModule.registerAsync({
            isGlobal: true,
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                stores: [createKeyv(config.redis.url)],
                ttl: 0,
            }),
            inject: [ConfigService],
        }),

        ThrottlerModule.forRoot([
            {
                ttl: 60,
                limit: 120,
            },
        ]),

        PrismaModule,
        AppCacheModule,
        EmailModule,

        AuthModule,
        UsersModule,

        SessionsModule,
        QuestionsModule,
        ResponsesModule,
        ScoringModule,
        ResultsModule,
        RecommendationsModule,

        AssessmentsModule,
        CareersModule,
        UniversitiesModule,
        ResourcesModule,

        AnalyticsModule,
        AiModule,
    ],
    controllers: [HealthController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerBehindProxyGuard,
        },
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
    ],
})
export class AppModule {}
