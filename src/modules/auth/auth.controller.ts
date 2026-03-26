import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) {
    }

    @Public()
    @Throttle({ default: { limit: 10, ttl: 60 } })
    @Post('register')
    register(@Body() dto: RegisterDto, @Req() req: any) {
        return this.auth.register(dto, req.ip, req.headers['user-agent']);
    }

    @Public()
    @Throttle({ default: { limit: 10, ttl: 60 } })
    @Post('login')
    login(@Body() dto: LoginDto, @Req() req: any) {
        return this.auth.login(dto, req.ip, req.headers['user-agent']);
    }

    @Public()
    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Post('refresh')
    refresh(@Body() dto: RefreshTokenDto, @Req() req: any) {
        return this.auth.refresh(dto.refreshToken, req.ip, req.headers['user-agent']);
    }

    @Public()
    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Post('logout')
    logout(@Body() dto: RefreshTokenDto) {
        return this.auth.logout(dto.refreshToken);
    }

    @Public()
    @Throttle({ default: { limit: 5, ttl: 60 } })
    @Post('request-password-reset')
    requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
        return this.auth.requestPasswordReset(dto.email);
    }

    @Public()
    @Post('reset-password')
    resetPassword(@Body() dto: ResetPasswordDto) {
        return this.auth.resetPassword(dto.token, dto.newPassword);
    }

    @Get('me')
    me(@CurrentUser() user: any) {
        return user;
    }
}
