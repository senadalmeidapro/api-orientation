import {
    Injectable,
    BadRequestException,
    UnauthorizedException,
    Inject,
    Logger,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Prisma, User, UserStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { ConfigService } from '../../../common/config/config.service';
import { Request } from 'express';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtPayload } from '../interfaces';
import { AuthDeviceService } from './auth-device.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

export const authTokenTypes = {
    emailVerification: 'email_verification',
    resetPassword: 'reset_password',
    refresh: 'refresh',
} as const;

export type UserTokenType = (typeof authTokenTypes)[keyof typeof authTokenTypes];

export type SignedTokens = {
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
};

export type JwtUser = Pick<User, 'id' | 'email' | 'role'>;

const defaultEmailVerificationTtl = '24h';
const defaultPasswordResetTtl = '1h';

export type RefreshTokenRecord = Prisma.AuthTokenGetPayload<{
    select: {
        id: true;
        tokenHash: true;
        userId: true;
        user: {
            select: {
                id: true;
                email: true;
                role: true;
                status: true;
                isDeleted: true;
                emailVerifiedAt: true;
            };
        };
    };
}>;

// Helper to provide StringValue since standard jsonwebtoken allows StringValue

@Injectable()
export class AuthTokenService {
    private readonly logger = new Logger(AuthTokenService.name);

    public readonly refreshTokenTtlMs: number;
    private readonly emailVerificationTtlMs: number;
    private readonly passwordResetTtlMs: number;

    private readonly PREFIX = 'blacklist:token:';

    constructor(
        @Inject(CACHE_MANAGER) private cache: Cache,

        private readonly config: ConfigService,
        private readonly jwt: JwtService,
        private readonly prisma: PrismaService,
        private readonly deviceService: AuthDeviceService,
    ) {
        this.refreshTokenTtlMs = this.durationToMs(
            config.jwt.refreshExpiresIn,
            7 * 24 * 60 * 60 * 1000,
        );
        this.emailVerificationTtlMs = this.durationToMs(
            defaultEmailVerificationTtl,
            24 * 60 * 60 * 1000,
        );
        this.passwordResetTtlMs = this.durationToMs(defaultPasswordResetTtl, 60 * 60 * 1000);
    }

    hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    generateSecureToken(length: number = 32): string {
        return crypto.randomBytes(length).toString('hex');
    }

    async signTokens(user: JwtUser): Promise<SignedTokens> {
        const accessPayload = this.buildJwtPayload(user, 'access');
        const refreshPayload = this.buildJwtPayload(user, 'refresh');

        const accessToken = await this.jwt.signAsync(
            accessPayload,
            this.getJwtSignOptions('access'),
        );
        const refreshToken = await this.jwt.signAsync(
            refreshPayload,
            this.getJwtSignOptions('refresh'),
        );

        return {
            accessToken,
            refreshToken,
            refreshTokenExpiresAt: new Date(Date.now() + this.refreshTokenTtlMs),
        };
    }

    async validateRefreshToken(refreshToken: string): Promise<RefreshTokenRecord> {
        let payload: JwtPayload;
        try {
            payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
                secret: this.config.jwt.refreshSecret,
                issuer: this.config.jwt.issuer,
                audience: this.config.jwt.audience,
            });
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (payload.type !== 'refresh') {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const tokenHash = this.hashToken(refreshToken);
        const tokenRecord = await this.prisma.authToken.findFirst({
            where: {
                tokenHash: tokenHash,
                tokenType: authTokenTypes.refresh,
                expiresAt: { gt: new Date() },
                invalidatedAt: null,
                user: {
                    id: payload.sub,
                    status: UserStatus.ACTIVE,
                    isDeleted: false,
                },
            },
            select: {
                id: true,
                tokenHash: true,
                userId: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        status: true,
                        isDeleted: true,
                        emailVerifiedAt: true,
                    },
                },
            },
        });

        if (!tokenRecord) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (!tokenRecord.user.emailVerifiedAt) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        return tokenRecord;
    }

    buildRefreshTokenPayload(
        refreshToken: string,
        expiresAt: Date,
        usedAt: Date | null,
        req?: Request,
    ) {
        const tokenHash = this.hashToken(refreshToken);
        const deviceInfo = this.deviceService.extractDeviceInfo(req);
        const metadata: Prisma.InputJsonValue | undefined = deviceInfo
            ? (this.deviceService.cleanMetadata(deviceInfo) as Prisma.InputJsonValue)
            : undefined;

        return {
            tokenHash: tokenHash,
            tokenType: authTokenTypes.refresh,
            expiresAt: expiresAt,
            usedAt: usedAt,
            invalidatedAt: null,
            ipAddress: deviceInfo?.ipAddress ?? null,
            userAgent: deviceInfo?.userAgent ?? null,
            metadata: metadata ?? {},
        };
    }

    buildRefreshTokenUpsert(
        userId: string,
        refreshToken: string,
        expiresAt: Date,
        usedAt: Date | null,
        req?: Request,
    ): Prisma.AuthTokenUpsertArgs {
        const tokenPayload = this.buildRefreshTokenPayload(refreshToken, expiresAt, usedAt, req);

        return {
            where: { userId },
            update: tokenPayload,
            create: {
                ...tokenPayload,
                user: { connect: { id: userId } },
            },
        };
    }

    async createUserToken(
        userId: string,
        type: UserTokenType,
        req?: Request,
        tx: Prisma.TransactionClient = this.prisma,
    ) {
        const token = this.generateSecureToken(32);
        const tokenHash = this.hashToken(token);
        const expiresAt = new Date(Date.now() + this.getUserTokenTtl(type));
        const deviceInfo = req ? this.deviceService.extractDeviceInfo(req) : null;
        const metadata: Prisma.InputJsonValue | undefined = deviceInfo
            ? (this.deviceService.cleanMetadata(deviceInfo) as Prisma.InputJsonValue)
            : undefined;

        await tx.token.updateMany({
            where: { userId, tokenType: type, deletedAt: null },
            data: { deletedAt: new Date() },
        });

        await tx.token.create({
            data: {
                tokenHash: tokenHash,
                tokenType: type,
                expiresAt: expiresAt,
                metadata: metadata ?? {},
                user: { connect: { id: userId } },
            },
        });

        return token;
    }

    async validateUserToken(token: string, type: UserTokenType) {
        const tokenHash = this.hashToken(token);
        const record = await this.prisma.token.findFirst({
            where: {
                tokenHash: tokenHash,
                tokenType: type,
                expiresAt: { gt: new Date() },
                deletedAt: null,
                user: {
                    isDeleted: false,
                    status: { not: UserStatus.DELETED },
                },
            },
            select: {
                id: true,
                user: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
        });

        if (!record || !record.user) {
            throw new BadRequestException('Invalid or expired token');
        }

        if (record.user.status === UserStatus.SUSPENDED) {
            throw new UnauthorizedException('Compte suspendu');
        }

        return { user: record.user, tokenId: record.id };
    }

    /**
     * Ajoute un token JWT à la blacklist Redis.
     * Le TTL est automatiquement défini sur sa durée de vie restante.
     */
    async addToBlacklist(token: string): Promise<void> {
        const key = this.PREFIX + token;
        await this.cache.set(key, 'revoked', 16 * 60 * 1000);
    }

    /**
     * Vérifie si un token est présent dans la blacklist.
     */
    async isBlacklisted(token: string): Promise<boolean> {
        const key = this.PREFIX + token;
        const value = await this.cache.get(key);
        return value !== undefined && value !== null;
    }

    private getUserTokenTtl(type: UserTokenType): number {
        switch (type) {
            case authTokenTypes.emailVerification:
                return this.emailVerificationTtlMs;
            case authTokenTypes.resetPassword:
                return this.passwordResetTtlMs;
            default:
                return this.emailVerificationTtlMs;
        }
    }

    private buildJwtPayload(user: JwtUser, type: JwtPayload['type']): JwtPayload {
        return {
            sub: user.id,
            email: user.email,
            role: user.role,
            type,
        };
    }

    private getJwtSignOptions(tokenType: 'access' | 'refresh'): JwtSignOptions {
        return {
            secret:
                tokenType === 'access'
                    ? this.config.jwt.accessSecret
                    : this.config.jwt.refreshSecret,
            expiresIn:
                tokenType === 'access'
                    ? this.config.jwt.accessExpiresIn
                    : this.config.jwt.refreshExpiresIn,
            issuer: this.config.jwt.issuer,
            audience: this.config.jwt.audience,
        };
    }

    private durationToMs(value: string | number, fallbackMs: number): number {
        try {
            if (typeof value === 'number' && Number.isFinite(value)) {
                return value * 1000;
            }

            const raw = String(value).trim();
            if (/^\d+$/.test(raw)) {
                return Number(raw) * 1000;
            }

            const match = raw.match(/^(\d+(?:\.\d+)?)(ms|s|m|h|d)$/i);
            if (!match) {
                return fallbackMs;
            }

            const amount = Number(match[1]);
            const unit = match[2]!.toLowerCase();

            switch (unit) {
                case 'ms':
                    return amount;
                case 's':
                    return amount * 1000;
                case 'm':
                    return amount * 60 * 1000;
                case 'h':
                    return amount * 60 * 60 * 1000;
                case 'd':
                    return amount * 24 * 60 * 60 * 1000;
                default:
                    return fallbackMs;
            }
        } catch {
            return fallbackMs;
        }
    }
}
