import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateRolesDto } from './dto/update-roles.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {
    }

    async getMe(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { settings: true, userLevel: true },
        });
        if (!user) throw new NotFoundException('Utilisateur introuvable');
        return user;
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const birthDate = dto.birthDate ? new Date(dto.birthDate) : undefined;
        if (dto.birthDate && Number.isNaN(birthDate?.getTime() ?? 0)) {
            throw new BadRequestException('Date de naissance invalide');
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                birthDate,
                gender: dto.gender,
                department: dto.department,
                city: dto.city,
                school: dto.school,
                level: dto.level,
                preferredLanguage: dto.preferredLanguage,
                acceptNotifications: dto.acceptNotifications,
            },
        });
    }

    async updateSettings(userId: string, dto: UpdateSettingsDto) {
        return this.prisma.userSettings.upsert({
            where: { userId },
            update: {
                theme: dto.theme,
                fontSize: dto.fontSize,
                shareResults: dto.shareResults,
            },
            create: {
                userId,
                theme: dto.theme,
                fontSize: dto.fontSize,
                shareResults: dto.shareResults ?? false,
            },
        });
    }

    async listUsers(dto: ListUsersDto) {
        const where: any = {};
        if (dto.search) {
            where.OR = [
                { email: { contains: dto.search, mode: 'insensitive' } },
                { firstName: { contains: dto.search, mode: 'insensitive' } },
                { lastName: { contains: dto.search, mode: 'insensitive' } },
            ];
        }
        const limit = Math.min(dto.limit ?? 50, 200);
        return this.prisma.user.findMany({
            where,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isAdmin: true,
                createdAt: true,
            },
        });
    }

    async updateRoles(userId: string, dto: UpdateRolesDto) {
        const roles = dto.roles.map((r) => r.toUpperCase()) as UserRole[];
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                roles,
                isAdmin: dto.isAdmin ?? undefined,
            },
            select: { id: true, email: true, isAdmin: true, roles: true },
        });
    }

    health() {
        return { status: 'ok', module: 'users' };
    }
}
