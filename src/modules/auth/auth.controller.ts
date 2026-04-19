import { Body, Controller, Get, Post, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from './guards/jwt.guard';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';

import {
    AuthActionResponseDto,
    AuthLoginResponseDto,
    AuthRefreshResponseDto,
    AuthRegisterResponseDto,
    EmailDto,
    LoginDto,
    LogoutDto,
    RefreshDto,
    RegisterDto,
    ResetPasswordConfirmDto,
    TokenDto,
} from './dto';

import { Throttle } from '@nestjs/throttler';
import {
    ApiBearerAuth,
    ApiBody,
    ApiHeader,
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiErrorResponseDto } from '../../common/dto/api-response.dto';
import { ConfigService } from '../../common/config/config.service';
// import { ApiStandardCreatedResponse, ApiStandardErrorResponses } from '../../common/swagger';

const THROTTLE_AUTH_DEFAULT = { default: { limit: 20, ttl: 60 } } as const;
const THROTTLE_AUTH_REFRESH = { default: { limit: 30, ttl: 60 } } as const;
const THROTTLE_AUTH_SENSITIVE = { default: { limit: 10, ttl: 60 } } as const;

@ApiTags('Auth')
// @ApiStandardErrorResponses()
@Controller('api/v1/auth')
export class AuthController {
    constructor(private readonly auth: AuthService, private readonly config: ConfigService) {}

    // =========================
    // REGISTER
    // =========================
    @ApiOperation({
        summary: 'Créer un compte utilisateur',
        description:
            'Endpoint public d’inscription. Valide les informations de profil et le mot de passe fort avant création de compte.',
    })
    @ApiBody({
        type: RegisterDto,
        description:
            'Données d’inscription: email valide, prénom/nom, mot de passe fort, acceptation des conditions.',
    })
    // @ApiStandardCreatedResponse({
    //     description: 'Compte créé avec succès.',
    //     model: AuthRegisterResponseDto,
    //     message: 'Ressource créée avec succès.',
    // })
    @ApiResponse({
        status: 403,
        description: 'Conditions d’utilisation non acceptées.',
    })
    @ApiResponse({
        status: 409,
        description: 'Email déjà enregistré.',
    })
    @Public()
    @Throttle(THROTTLE_AUTH_DEFAULT)
    @Post('register')
    register(@Body() dto: RegisterDto, @Req() req: Request) {
        return this.auth.register(dto, req);
    }

    // =========================
    // LOGIN
    // =========================
    @ApiOperation({
        summary: 'Authentifier un utilisateur',
        description:
            'Endpoint public de connexion. Retourne un access token et un refresh token après validation des identifiants.',
    })
    @ApiBody({
        type: LoginDto,
        description: 'Identifiants de connexion (email et mot de passe).',
    })
    // @ApiStandardCreatedResponse({
    //     description: 'Connexion réussie.',
    //     model: AuthLoginResponseDto,
    //     message: 'Connexion réussie.',
    // })
    @ApiUnauthorizedResponse({
        description: 'Identifiants invalides.',
        type: ApiErrorResponseDto,
        schema: {
            example: {
                success: false,
                statusCode: 401,
                message: 'Identifiants invalides',
                error: 'Unauthorized',
                path: '/auth/login',
                timestamp: '2026-04-15T07:37:14.360Z',
            },
        },
    })
    @ApiResponse({
        status: 403,
        description: 'Compte inactif ou email non vérifié.',
    })
    @Public()
    @Throttle(THROTTLE_AUTH_DEFAULT)
    @Post('login')
    login(@Body() dto: LoginDto, @Req() req: Request) {
        return this.auth.login(dto, req);
    }

    // =========================
    // REFRESH TOKEN
    // =========================
    @ApiOperation({
        summary: 'Renouveler les tokens JWT',
        description:
            'Endpoint public qui prend un refresh token valide et retourne un nouveau couple access/refresh token.',
    })
    @ApiBody({
        type: RefreshDto,
        description: 'Refresh token JWT valide non révoqué.',
    })
    // @ApiStandardCreatedResponse({
    //     description: 'Tokens renouvelés.',
    //     model: AuthRefreshResponseDto,
    //     message: 'Tokens renouvelés.',
    // })
    @ApiUnauthorizedResponse({
        description: 'Refresh token invalide ou expiré.',
        type: ApiErrorResponseDto,
        schema: {
            example: {
                success: false,
                statusCode: 401,
                message: 'Invalid refresh token',
                error: 'Unauthorized',
                path: '/auth/refresh',
                timestamp: '2026-04-15T07:37:14.360Z',
            },
        },
    })
    @Public()
    @Throttle(THROTTLE_AUTH_REFRESH)
    @Post('refresh')
    refresh(@Body() dto: RefreshDto, @Req() req: Request) {
        return this.auth.refresh(dto, req);
    }

    // =========================
    // LOGOUT (PROTECTED)
    // =========================
    @ApiOperation({
        summary: 'Déconnecter un utilisateur authentifié',
        description:
            'Révoque le refresh token envoyé dans le body et invalide le JWT access transmis dans le header Authorization.',
    })
    @ApiBearerAuth('access-token')
    @ApiHeader({
        name: 'Authorization',
        required: true,
        description: 'JWT access token au format Bearer <token>.',
        example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access.signature',
    })
    @ApiBody({
        type: LogoutDto,
        description: 'Refresh token à invalider.',
    })
    // @ApiStandardCreatedResponse({
    //     description: 'Déconnexion effectuée.',
    //     model: AuthActionResponseDto,
    //     message: 'Déconnexion effectuée.',
    // })
    @ApiUnauthorizedResponse({
        description: 'Token manquant, invalide ou refresh token non valide.',
        type: ApiErrorResponseDto,
        schema: {
            example: {
                success: false,
                statusCode: 401,
                message: 'Token manquant ou invalide',
                error: 'Unauthorized',
                path: '/auth/logout',
                timestamp: '2026-04-15T07:37:14.360Z',
            },
        },
    })
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
    @ApiOperation({
        summary: 'Demander une réinitialisation de mot de passe',
        description:
            'Endpoint public. Retourne toujours un message neutre pour éviter l’énumération de comptes.',
    })
    @ApiBody({
        type: EmailDto,
        description: 'Email du compte cible.',
    })
    // @ApiStandardCreatedResponse({
    //     description: 'Demande de réinitialisation traitée.',
    //     model: AuthActionResponseDto,
    //     message: 'Demande de réinitialisation traitée.',
    // })
    @Public()
    @Throttle(THROTTLE_AUTH_SENSITIVE)
    @Post('password-reset/request')
    passwordResetRequest(@Body() dto: EmailDto, @Req() req: Request) {
        return this.auth.passwordResetRequest(dto, req);
    }

    // =========================
    // PASSWORD RESET CONFIRM
    // =========================
    @ApiOperation({
        summary: 'Confirmer la réinitialisation du mot de passe',
        description:
            'Valide le token de réinitialisation, remplace le mot de passe et invalide les sessions actives de l’utilisateur.',
    })
    @ApiBody({
        type: ResetPasswordConfirmDto,
        description:
            'Token de réinitialisation (hex 64 chars), ancien mot de passe (champ historique) et nouveau mot de passe fort.',
    })
    // @ApiStandardCreatedResponse({
    //     description: 'Mot de passe réinitialisé.',
    //     model: AuthActionResponseDto,
    //     message: 'Mot de passe réinitialisé.',
    // })
    @ApiUnauthorizedResponse({
        description: 'Token de réinitialisation invalide ou expiré.',
        type: ApiErrorResponseDto,
    })
    @Public()
    @Throttle(THROTTLE_AUTH_DEFAULT)
    @Post('password-reset/confirm')
    passwordReset(@Body() dto: ResetPasswordConfirmDto) {
        return this.auth.passwordReset(dto, dto.token);
    }

    // =========================
    // VERIFY EMAIL
    // =========================
    @ApiOperation({
        summary: 'Vérifier l’email utilisateur',
        description:
            'Valide le token de vérification email et active le compte utilisateur correspondant.',
    })
    @ApiBody({
        type: TokenDto,
        description: 'Token de vérification email (hexadécimal 64 caractères).',
    })
    // @ApiStandardCreatedResponse({
    //     description: 'Email vérifié.',
    //     model: AuthActionResponseDto,
    //     message: 'Email vérifié.',
    // })
    @ApiUnauthorizedResponse({
        description: 'Token invalide ou expiré.',
        type: ApiErrorResponseDto,
    })
    @Public()
    @Throttle(THROTTLE_AUTH_REFRESH)
    @Get('verify-email')
    verifyEmail(@Query() dto: TokenDto) {
        return this.auth.verifyEmail(dto.token);
    }
}
