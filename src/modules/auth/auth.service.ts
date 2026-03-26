import {
    ConflictException,
    Injectable,
    NotFoundException,
    ServiceUnavailableException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { MailService } from '../../common/mail/mail.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
        private readonly mail: MailService,
    ) {
    }

    async register(dto: RegisterDto, ipAddress?: string, userAgent?: string) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) throw new ConflictException('Email déjà utilisé');

        const passwordHash = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: passwordHash,
                firstName: dto.firstName,
                lastName: dto.lastName,
                roles: [],
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isAdmin: true,
                roles: true,
            },
        });

        return this.signTokens(user.id, user.email, user.isAdmin, user.roles, ipAddress, userAgent);
    }

    async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user) throw new UnauthorizedException('Identifiants invalides');

        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid) throw new UnauthorizedException('Identifiants invalides');

        return this.signTokens(
            user.id,
            user.email,
            user.isAdmin,
            user.roles ?? [],
            ipAddress,
            userAgent,
        );
    }

    async refresh(refreshToken: string, ipAddress?: string, userAgent?: string) {
        const tokenHash = this.hashToken(refreshToken);
        const record = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
        if (!record || record.revokedAt || record.expiresAt < new Date()) {
            throw new UnauthorizedException('Refresh token invalide');
        }

        const user = await this.prisma.user.findUnique({ where: { id: record.userId } });
        if (!user) throw new NotFoundException('Utilisateur introuvable');

        // rotate refresh token
        await this.prisma.refreshToken.update({
            where: { id: record.id },
            data: { revokedAt: new Date() },
        });

        return this.signTokens(
            user.id,
            user.email,
            user.isAdmin,
            user.roles ?? [],
            ipAddress,
            userAgent,
        );
    }

    async logout(refreshToken: string) {
        const tokenHash = this.hashToken(refreshToken);
        const record = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
        if (!record) return { success: true };

        await this.prisma.refreshToken.update({
            where: { id: record.id },
            data: { revokedAt: new Date() },
        });

        return { success: true };
    }

    async requestPasswordReset(email: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) return { success: true };

        const token = randomBytes(32).toString('hex');
        const tokenHash = this.hashToken(token);
        const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

        await this.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt,
            },
        });

        const sent = await this.mail.sendPasswordReset(user.email, token);
        if (!sent) {
            if (process.env.NODE_ENV === 'production') {
                throw new ServiceUnavailableException('SMTP non configuré');
            }
            // fallback pour dev/test
            return { success: true, token };
        }
        return { success: true };
    }

    async resetPassword(token: string, newPassword: string) {
        const tokenHash = this.hashToken(token);
        const record = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });
        if (!record || record.usedAt || record.expiresAt < new Date()) {
            throw new UnauthorizedException('Token invalide ou expiré');
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: record.userId },
            data: { password: passwordHash },
        });

        await this.prisma.passwordResetToken.update({
            where: { id: record.id },
            data: { usedAt: new Date() },
        });

        return { success: true };
    }

    private async signTokens(
        userId: string,
        email: string,
        isAdmin: boolean,
        roles: string[],
        ipAddress?: string,
        userAgent?: string,
    ) {
        const payload = { sub: userId, email, isAdmin, roles };
        const accessToken = this.jwt.sign(payload);

        const refreshToken = randomBytes(48).toString('hex');
        const tokenHash = this.hashToken(refreshToken);
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

        await this.prisma.refreshToken.create({
            data: {
                userId,
                tokenHash,
                expiresAt,
                ipAddress,
                userAgent,
            },
        });

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }

    private hashToken(token: string) {
        return createHash('sha256').update(token).digest('hex');
    }
}
