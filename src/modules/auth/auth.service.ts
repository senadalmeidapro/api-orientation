import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { Prisma, User, UserRole, UserStatus } from '@prisma/client';
import { Request } from 'express';
import { EmailService } from '@common/email/email.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailDto, LoginDto, LogoutDto, RefreshDto, RegisterDto, ResetPasswordDto } from './dto';
import { AuthTokenService, authTokenTypes } from './services/auth-token.service';
import { PasswordService } from './services/password.service';
import { ConfigService } from '@common/config/config.service';
import type { JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly token: AuthTokenService,
        private readonly password: PasswordService,
        private readonly config: ConfigService,
        private readonly email: EmailService,
    ) {}

    async register(dto: RegisterDto, req?: Request) {
        const email = this.normalizeEmail(dto.email);

        if (!dto.acceptTerms) {
            throw new ForbiddenException('Accept the terms and conditions of service');
        }

        const existingUser = await this.prisma.user.findUnique({
            where: { email },
            select: { id: true, isDeleted: true },
        });

        if (existingUser && !existingUser.isDeleted) {
            throw new ConflictException('Email already registered');
        }

        const passwordHash = await this.password.hashPassword(dto.password);

        let user: User;
        let verificationToken: string;
        try {
            ({ user, verificationToken } = await this.prisma.$transaction(async (tx) => {
                const createdUser = await tx.user.create({
                    data: {
                        email,
                        firstName: this.normalizeName(dto.firstName),
                        lastName: this.normalizeName(dto.lastName),
                        password: passwordHash,
                        role: UserRole.USER,
                        status: UserStatus.PENDING,
                    },
                });

                const token = await this.token.createUserToken(
                    createdUser.id,
                    authTokenTypes.emailVerification,
                    req,
                    tx,
                );

                return { user: createdUser, verificationToken: token };
            }));
        } catch (error) {
            if (this.isUniqueConstraintError(error)) {
                throw new ConflictException('Email already registered');
            }
            throw new InternalServerErrorException('Unable to create user');
        }

        if (user.email) {
            await this.email.sendVerificationEmail(
                {
                    email: user.email,
                    subject: 'Vérification de votre email',
                    firstName: user.firstName ?? '',
                    lastName: user.lastName ?? '',
                    fullName: user.firstName + ' ' + user.lastName,
                },
                `${this.config.app.frontendUrl}/auth/check-email?token=${verificationToken}`,
            );
        }

        return {
            message: 'Registration successful. Please check your email to verify your account.',
            requiresEmailVerification: true,
        };
    }

    async login(dto: LoginDto, req?: Request) {
        const email = this.normalizeEmail(dto.email);
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                role: true,
                status: true,
                isDeleted: true,
                emailVerifiedAt: true,
            },
        });

        if (!user || user.isDeleted || !user.password) {
            throw new UnauthorizedException('Identifiants invalides');
        }

        const isValidPassword = await this.password.comparePassword(dto.password, user.password);
        if (!isValidPassword) {
            throw new UnauthorizedException('Identifiants invalides');
        }

        if (user.status !== UserStatus.ACTIVE) {
            throw new ForbiddenException('Compte inactif');
        }

        if (!user.emailVerifiedAt) {
            throw new ForbiddenException('Email non vérifié');
        }

        const tokens = await this.token.signTokens(user);
        const refreshTokenUpsert = this.token.buildRefreshTokenUpsert(
            user.id,
            tokens.refreshToken,
            tokens.refreshTokenExpiresAt,
            null,
            req,
        );

        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
            }),
            this.prisma.authToken.upsert(refreshTokenUpsert),
        ]);

        return {
            data: {
                sub: user.id,
                email: user.email,
                role: user.role,
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    async refresh(
        dto: RefreshDto,
        req?: Request,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const tokenRecord = await this.token.validateRefreshToken(dto.refreshToken);
        const tokens = await this.token.signTokens(tokenRecord.user);

        const refreshTokenPayload = this.token.buildRefreshTokenPayload(
            tokens.refreshToken,
            tokens.refreshTokenExpiresAt,
            new Date(),
            req,
        );

        const result = await this.prisma.authToken.updateMany({
            where: {
                id: tokenRecord.id,
                tokenHash: tokenRecord.tokenHash,
                invalidatedAt: null,
            },
            data: refreshTokenPayload,
        });

        if (result.count === 0) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    async logout(dto: LogoutDto, token: string) {
        const tokenRecord = await this.token.validateRefreshToken(dto.refreshToken);

        await this.token.addToBlacklist(token);

        const result = await this.prisma.authToken.updateMany({
            where: {
                id: tokenRecord.id,
                tokenHash: tokenRecord.tokenHash,
                invalidatedAt: null,
            },
            data: { invalidatedAt: new Date() },
        });

        if (result.count === 0) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        return { message: 'Déconnexion effectuée avec succès.' };
    }

    async passwordResetRequest(dto: EmailDto, req?: Request) {
        const email = this.normalizeEmail(dto.email);
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                status: true,
                isDeleted: true,
            },
        });

        if (!user || user.isDeleted || user.status === UserStatus.DELETED) {
            return {
                message:
                    'Si un compte existe pour cet email, un message de réinitialisation a été envoyé.',
            };
        }

        if (user.status === UserStatus.SUSPENDED) {
            return {
                message:
                    'Si un compte existe pour cet email, un message de réinitialisation a été envoyé.',
            };
        }

        const token = await this.token.createUserToken(user.id, authTokenTypes.resetPassword, req);

        if (user.email) {
            await this.email.sendPasswordResetEmail(
                {
                    email: user.email,
                    subject: 'Réinitialisation de mot de passe',
                    firstName: user.firstName ?? '',
                    lastName: user.lastName ?? '',
                    fullName: user.firstName + ' ' + user.lastName,
                },
                `${this.config.app.frontendUrl}/auth/reset-password?token=${token}`,
            );
        }

        return {
            message:
                'Si un compte existe pour cet email, un message de réinitialisation a été envoyé.',
        };
    }

    async passwordReset(dto: ResetPasswordDto, token: string) {
        const confirmPassword = dto.oldPassword;
        if (dto.newPassword !== confirmPassword) {
            throw new BadRequestException('Les mots de passe ne correspondent pas');
        }

        const { user, tokenId } = await this.token.validateUserToken(
            token,
            authTokenTypes.resetPassword,
        );
        const passwordHash = await this.password.hashPassword(dto.newPassword);
        const now = new Date();

        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: user.id },
                data: { password: passwordHash },
            }),
            this.prisma.token.update({
                where: { id: tokenId },
                data: { deletedAt: now },
            }),
            this.prisma.authToken.updateMany({
                where: { userId: user.id, invalidatedAt: null },
                data: { invalidatedAt: now },
            }),
        ]);

        return { message: 'Mot de passe réinitialisé avec succès.' };
    }

    async verifyEmail(token: string) {
        const { user, tokenId } = await this.token.validateUserToken(
            token,
            authTokenTypes.emailVerification,
        );

        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: user.id },
                data: {
                    emailVerifiedAt: new Date(),
                    status: UserStatus.ACTIVE,
                },
            }),
            this.prisma.token.update({
                where: { id: tokenId },
                data: { deletedAt: new Date() },
            }),
        ]);

        return { message: 'Email vérifié avec succès.' };
    }

    async validateUserFromJwt(payload: JwtPayload) {
        const issuer =
            payload.issuer ??
            (payload as JwtPayload & { iss?: string; aud?: string | string[] }).iss;
        if (!issuer || issuer !== this.config.jwt.issuer) {
            throw new UnauthorizedException('Invalid token');
        }

        const audience =
            payload.audience ??
            (payload as JwtPayload & { iss?: string; aud?: string | string[] }).aud;
        const audienceMatches = Array.isArray(audience)
            ? audience.includes(this.config.jwt.audience)
            : audience === this.config.jwt.audience;

        if (!audienceMatches) {
            throw new UnauthorizedException('Invalid token');
        }

        if (payload.type !== 'access') {
            throw new UnauthorizedException('Invalid token');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                isDeleted: true,
                emailVerifiedAt: true,
            },
        });

        if (!user || user.isDeleted) {
            throw new UnauthorizedException('Invalid token');
        }

        if (user.status !== UserStatus.ACTIVE || !user.emailVerifiedAt) {
            throw new UnauthorizedException('Invalid token');
        }

        return user;
    }

    private normalizeEmail(email: string): string {
        return email.trim().toLowerCase();
    }

    private normalizeName(name: string): string {
        return name.trim().replace(/\s+/g, ' ');
    }

    private isUniqueConstraintError(error: unknown): boolean {
        return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
    }
}
