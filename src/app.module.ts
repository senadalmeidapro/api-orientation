import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { ResponsesModule } from './modules/responses/responses.module';
import { ScoringModule } from './modules/scoring/scoring.module';
import { ResultsModule } from './modules/results/results.module';
import { AdminModule } from './modules/admin/admin.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { BadgesModule } from './modules/badges/badges.module';
import { CareersModule } from './modules/careers/careers.module';
import { ContactModule } from './modules/contact/contact.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { InstitutionsModule } from './modules/institutions/institutions.module';
import { LocalizationModule } from './modules/localization/localization.module';
import { MediaModule } from './modules/media/media.module';
import { OutcomesModule } from './modules/outcomes/outcomes.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { AdaptiveModule } from './modules/adaptive/adaptive.module';
import { AiModule } from './modules/ai/ai.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';
import { ConfigModule } from '@nestjs/config';
import { AuditModule } from './common/audit/audit.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // Rend le module disponible partout sans l'importer
            envFilePath: '.env', // Chemin vers votre fichier .env (par défaut c'est '.env')
            cache: true, // Met en cache les variables pour de meilleures performances
        }),
        ThrottlerModule.forRoot([
            {
                ttl: 60,
                limit: 120,
            },
        ]),
        AuditModule,
        PrismaModule,
        AuthModule,
        UsersModule,
        SessionsModule,
        QuestionsModule,
        ResponsesModule,
        ScoringModule,
        ResultsModule,
        RecommendationsModule,
        CareersModule,
        ResourcesModule,
        InstitutionsModule,
        AnnouncementsModule,
        ContactModule,
        BadgesModule,
        FeedbackModule,
        OutcomesModule,
        LocalizationModule,
        MediaModule,
        AdminModule,
        AdaptiveModule,
        AiModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        { provide: APP_GUARD, useClass: ThrottlerBehindProxyGuard },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
    ],
})
export class AppModule {
}
