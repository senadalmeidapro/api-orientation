import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmailModule } from '@common/email/email.module';
import { PasswordService } from './services/password.service';
import { AuthDeviceService } from './services/auth-device.service';
import { AuthTokenService } from './services/auth-token.service';
import { ConfigModule } from '@common/config/config.module';
import { ConfigService } from '@common/config/config.service';

@Global()
@Module({
  imports: [
    PrismaModule,
    PassportModule,
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.jwt.accessSecret,
        signOptions: {
          expiresIn: config.jwt.accessExpiresIn,
          issuer: config.jwt.issuer,
          audience: config.jwt.audience,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PasswordService, AuthDeviceService, AuthTokenService],
  exports: [AuthService, PasswordService, AuthDeviceService, AuthTokenService],
})
export class AuthModule {}
