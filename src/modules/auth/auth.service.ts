import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { Prisma, User, UserRole, UserStatus } from '@prisma/client';
import { Request } from 'express';
import { EmailService } from '../../common/email/email.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailDto, LoginDto, LogoutDto, RefreshDto, RegisterDto, ResetPasswordDto } from './dto';
import { JwtPayload } from './interfaces';
import { AuthTokenService, AUTH_TOKEN_TYPES } from './services/auth-token.service';
import { PasswordService } from './services/password.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly token: AuthTokenService,
        private readonly password: PasswordService,
        private readonly email: EmailService,
    ) {}

    async register(dto: RegisterDto, req?: Request) {
        const email = this.normalizeEmail(dto.email);

        if (!dto.acceptTerms) {
            throw new ForbiddenException('Accept the terms and conditions of service');
        }

        const existingUser = await this.prisma.user.findUnique({
            where: { email },
            select: { id: true, is_deleted: true },
        });

        if (existingUser && !existingUser.is_deleted) {
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
                        first_name: this.normalizeName(dto.firstName),
                        last_name: this.normalizeName(dto.lastName),
                        password: passwordHash,
                        role: UserRole.USER,
                        status: UserStatus.PENDING,
                    },
                });

                const token = await this.token.createUserToken(
                    createdUser.id,
                    AUTH_TOKEN_TYPES.emailVerification,
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

        // if (user.email) {
        //     await this.email.sendVerificationEmail({
        //         to: user.email,
        //         firstName: user.first_name,
        //         token: verificationToken,
        //         userId: user.id,
        //     });
        // }

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
                is_deleted: true,
                email_verified_at: true,
            },
        });

        if (!user || user.is_deleted || !user.password) {
            throw new UnauthorizedException('Identifiants invalides');
        }

        const isValidPassword = await this.password.comparePassword(dto.password, user.password);
        if (!isValidPassword) {
            throw new UnauthorizedException('Identifiants invalides');
        }

        if (user.status !== UserStatus.ACTIVE) {
            throw new ForbiddenException('Compte inactif');
        }

        if (!user.email_verified_at) {
            throw new ForbiddenException('Email non vérifié');
        }

        const tokens = await this.token.signTokens(user);
        const refreshTokenUpsert = await this.token.buildRefreshTokenUpsert(
            user.id,
            tokens.refreshToken,
            tokens.refreshTokenExpiresAt,
            null,
            req,
        );

        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: user.id },
                data: { last_login_at: new Date() },
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

        const refreshTokenPayload = await this.token.buildRefreshTokenPayload(
            tokens.refreshToken,
            tokens.refreshTokenExpiresAt,
            new Date(),
            req,
        );

        const result = await this.prisma.authToken.updateMany({
            where: {
                id: tokenRecord.id,
                token_hash: tokenRecord.token_hash,
                invalidated_at: null,
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
                token_hash: tokenRecord.token_hash,
                invalidated_at: null,
            },
            data: { invalidated_at: new Date() },
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
            select: { id: true, email: true, first_name: true, status: true, is_deleted: true },
        });

        if (!user || user.is_deleted || user.status === UserStatus.DELETED) {
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

        const token = await this.token.createUserToken(
            user.id,
            AUTH_TOKEN_TYPES.resetPassword,
            req,
        );

        if (user.email) {
            await this.email.sendPasswordResetEmail({
                to: user.email,
                firstName: user.first_name,
                token,
                userId: user.id,
            });
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
            AUTH_TOKEN_TYPES.resetPassword,
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
                data: { deleted_at: now },
            }),
            this.prisma.authToken.updateMany({
                where: { user_id: user.id, invalidated_at: null },
                data: { invalidated_at: now },
            }),
        ]);

        return { message: 'Mot de passe réinitialisé avec succès.' };
    }

    async verifyEmail(token: string) {
        const { user, tokenId } = await this.token.validateUserToken(
            token,
            AUTH_TOKEN_TYPES.emailVerification,
        );

        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: user.id },
                data: {
                    email_verified_at: new Date(),
                    status: UserStatus.ACTIVE,
                },
            }),
            this.prisma.token.update({
                where: { id: tokenId },
                data: { deleted_at: new Date() },
            }),
        ]);

        return { message: 'Email vérifié avec succès.' };
    }

    async validateUserFromJwt(payload: any) {
        if (!payload.iss || payload.iss !== this.token.jwtIssuer) {
            throw new UnauthorizedException('Invalid token');
        }

        const audienceMatches = Array.isArray(payload.aud)
            ? payload.aud.includes(this.token.jwtAudience)
            : payload.aud === this.token.jwtAudience;

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
                is_deleted: true,
                email_verified_at: true,
            },
        });

        if (!user || user.is_deleted) {
            throw new UnauthorizedException('Invalid token');
        }

        if (user.status !== UserStatus.ACTIVE || !user.email_verified_at) {
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
