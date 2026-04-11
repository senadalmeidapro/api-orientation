import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmailModule } from '../../common/email/email.module';
import { PasswordService } from './services/password.service';
import { AuthDeviceService } from './services/auth-device.service';
import { AuthTokenService } from './services/auth-token.service';

@Global()
@Module({
    imports: [
        PrismaModule,
        ConfigModule,
        PassportModule,
        EmailModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_ACCESS_SECRET') ?? config.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: (config.get<string | number>('JWT_ACCESS_TTL') ?? 900) as any,
                    issuer: config.get<string>('JWT_ISSUER') ?? 'api-orientation-issue',
                    audience: config.get<string>('JWT_AUDIENCE') ?? 'api-orientation-audience',
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, PasswordService, AuthDeviceService, AuthTokenService],
    exports: [AuthService, PasswordService, AuthDeviceService, AuthTokenService],
})
export class AuthModule {}
