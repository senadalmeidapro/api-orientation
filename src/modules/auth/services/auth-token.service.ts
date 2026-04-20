import {
    Injectable,
    BadRequestException,
    UnauthorizedException,
    InternalServerErrorException,
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

export const AUTH_TOKEN_TYPES = {
    emailVerification: 'email_verification',
    resetPassword: 'reset_password',
    refresh: 'refresh',
} as const;

export type UserTokenType = (typeof AUTH_TOKEN_TYPES)[keyof typeof AUTH_TOKEN_TYPES];

export type SignedTokens = {
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
};

export type JwtUser = Pick<User, 'id' | 'email' | 'role'>;

const DEFAULT_EMAIL_VERIFICATION_TTL = '24h';
const DEFAULT_PASSWORD_RESET_TTL = '1h';

export type RefreshTokenRecord = Prisma.AuthTokenGetPayload<{
    select: {
        id: true;
        token_hash: true;
        user_id: true;
        user: {
            select: {
                id: true;
                email: true;
                role: true;
                status: true;
                is_deleted: true;
                email_verified_at: true;
            };
        };
    };
}>;

// Helper to provide StringValue since standard jsonwebtoken allows StringValue
type Unit =
    | 'Years'
    | 'Year'
    | 'Yrs'
    | 'Yr'
    | 'Y'
    | 'Weeks'
    | 'Week'
    | 'W'
    | 'Days'
    | 'Day'
    | 'D'
    | 'Hours'
    | 'Hour'
    | 'Hrs'
    | 'Hr'
    | 'H'
    | 'Minutes'
    | 'Minute'
    | 'Mins'
    | 'Min'
    | 'M'
    | 'Seconds'
    | 'Second'
    | 'Secs'
    | 'Sec'
    | 's'
    | 'Milliseconds'
    | 'Millisecond'
    | 'Msecs'
    | 'Msec'
    | 'Ms';

type UnitAnyCase = Unit | Uppercase<Unit> | Lowercase<Unit>;

type StringValue = `${number}` | `${number}${UnitAnyCase}` | `${number} ${UnitAnyCase}`;

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
            DEFAULT_EMAIL_VERIFICATION_TTL,
            24 * 60 * 60 * 1000,
        );
        this.passwordResetTtlMs = this.durationToMs(DEFAULT_PASSWORD_RESET_TTL, 60 * 60 * 1000);
    }

    async hashToken(token: string): Promise<string> {
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

        const tokenHash = await this.hashToken(refreshToken);
        const tokenRecord = await this.prisma.authToken.findFirst({
            where: {
                token_hash: tokenHash,
                token_type: AUTH_TOKEN_TYPES.refresh,
                expires_at: { gt: new Date() },
                invalidated_at: null,
                user: {
                    id: payload.sub,
                    status: UserStatus.ACTIVE,
                    is_deleted: false,
                },
            },
            select: {
                id: true,
                token_hash: true,
                user_id: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        status: true,
                        is_deleted: true,
                        email_verified_at: true,
                    },
                },
            },
        });

        if (!tokenRecord) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (!tokenRecord.user.email_verified_at) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        return tokenRecord;
    }

    async buildRefreshTokenPayload(
        refreshToken: string,
        expiresAt: Date,
        usedAt: Date | null,
        req?: Request,
    ) {
        const tokenHash = await this.hashToken(refreshToken);
        const deviceInfo = this.deviceService.extractDeviceInfo(req);
        const metadata = deviceInfo ? this.deviceService.cleanMetadata(deviceInfo) : undefined;

        return {
            token_hash: tokenHash,
            token_type: AUTH_TOKEN_TYPES.refresh,
            expires_at: expiresAt,
            used_at: usedAt,
            invalidated_at: null,
            ip_address: deviceInfo?.ipAddress ?? null,
            user_agent: deviceInfo?.userAgent ?? null,
            metadata,
        };
    }

    async buildRefreshTokenUpsert(
        userId: string,
        refreshToken: string,
        expiresAt: Date,
        usedAt: Date | null,
        req?: Request,
    ): Promise<Prisma.AuthTokenUpsertArgs> {
        const tokenPayload = await this.buildRefreshTokenPayload(
            refreshToken,
            expiresAt,
            usedAt,
            req,
        );

        return {
            where: { user_id: userId },
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
        const tokenHash = await this.hashToken(token);
        const expiresAt = new Date(Date.now() + this.getUserTokenTtl(type));
        const deviceInfo = req ? this.deviceService.extractDeviceInfo(req) : null;
        const metadata = deviceInfo ? this.deviceService.cleanMetadata(deviceInfo) : undefined;

        await tx.token.updateMany({
            where: { user_id: userId, token_type: type, deleted_at: null },
            data: { deleted_at: new Date() },
        });

        await tx.token.create({
            data: {
                token_hash: tokenHash,
                token_type: type,
                expires_at: expiresAt,
                metadata,
                user: { connect: { id: userId } },
            },
        });

        return token;
    }

    async validateUserToken(token: string, type: UserTokenType) {
        const tokenHash = await this.hashToken(token);
        const record = await this.prisma.token.findFirst({
            where: {
                token_hash: tokenHash,
                token_type: type,
                expires_at: { gt: new Date() },
                deleted_at: null,
                user: {
                    is_deleted: false,
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
            case AUTH_TOKEN_TYPES.emailVerification:
                return this.emailVerificationTtlMs;
            case AUTH_TOKEN_TYPES.resetPassword:
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
            secret: tokenType === 'access' ? this.config.jwt.accessSecret : this.config.jwt.refreshSecret,
            expiresIn: (tokenType === 'access'
                ? this.config.jwt.accessExpiresIn
                : this.config.jwt.refreshExpiresIn) as any,
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
            const unit = match[2].toLowerCase();

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
