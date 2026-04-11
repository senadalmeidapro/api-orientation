import { Body, Controller, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from './guards/jwt.guard';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';

import {
    EmailDto,
    LoginDto,
    LogoutDto,
    RefreshDto,
    RegisterDto,
    ResetPasswordConfirmDto,
    TokenDto,
} from './dto';

import { Throttle } from '@nestjs/throttler';

const THROTTLE_AUTH_DEFAULT = { default: { limit: 20, ttl: 60 } } as const;
const THROTTLE_AUTH_REFRESH = { default: { limit: 30, ttl: 60 } } as const;
const THROTTLE_AUTH_SENSITIVE = { default: { limit: 10, ttl: 60 } } as const;

@Controller('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) {}

    // =========================
    // REGISTER
    // =========================
    @Public()
    @Throttle(THROTTLE_AUTH_DEFAULT)
    @Post('register')
    register(@Body() dto: RegisterDto, @Req() req: Request) {
        return this.auth.register(dto, req);
    }

    // =========================
    // LOGIN
    // =========================
    @Public()
    @Throttle(THROTTLE_AUTH_DEFAULT)
    @Post('login')
    login(@Body() dto: LoginDto, @Req() req: Request) {
        return this.auth.login(dto, req);
    }

    // =========================
    // REFRESH TOKEN
    // =========================
    @Public()
    @Throttle(THROTTLE_AUTH_REFRESH)
    @Post('refresh')
    refresh(@Body() dto: RefreshDto, @Req() req: Request) {
        return this.auth.refresh(dto, req);
    }

    // =========================
    // LOGOUT (PROTECTED)
    // =========================
    @UseGuards(JwtAuthGuard)
    @Throttle(THROTTLE_AUTH_REFRESH)
    @Post('logout')
    logout(@Req() req: Request, @Body() dto: LogoutDto) {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Token manquant ou invalide');
        }

        const token = authHeader.split(' ')[1];

        return this.auth.logout(dto, token);
    }

    // =========================
    // PASSWORD RESET REQUEST
    // =========================
    @Public()
    @Throttle(THROTTLE_AUTH_SENSITIVE)
    @Post('password-reset/request')
    passwordResetRequest(@Body() dto: EmailDto, @Req() req: Request) {
        return this.auth.passwordResetRequest(dto, req);
    }

    // =========================
    // PASSWORD RESET CONFIRM
    // =========================
    @Public()
    @Throttle(THROTTLE_AUTH_DEFAULT)
    @Post('password-reset/confirm')
    passwordReset(@Body() dto: ResetPasswordConfirmDto) {
        return this.auth.passwordReset(dto, dto.token);
    }

    // =========================
    // VERIFY EMAIL
    // =========================
    @Public()
    @Throttle(THROTTLE_AUTH_REFRESH)
    @Post('verify-email')
    verifyEmail(@Body() dto: TokenDto) {
        return this.auth.verifyEmail(dto.token);
    }
}
