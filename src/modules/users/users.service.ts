import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto, UserResponseDto } from './dto';

const userPublicSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    displayName: true,
    bio: true,
    role: true,
    status: true,
    emailVerifiedAt: true,
    lastLoginAt: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.UserSelect;

const userInternalSelect = {
    ...userPublicSelect,
    isDeleted: true,
} satisfies Prisma.UserSelect;

type UserInternal = Prisma.UserGetPayload<{ select: typeof userInternalSelect }>;

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(private readonly prisma: PrismaService) {}

    async createUser(data: {
        email: string;
        passwordHash: string;
        displayName?: string;
    }): Promise<UserResponseDto> {
        const created = await this.prisma.user.create({
            data: {
                email: data.email,
                password: data.passwordHash,
                ...(data.displayName !== undefined ? { displayName: data.displayName } : {}),
            },
            select: userPublicSelect,
        });
        return new UserResponseDto(created);
    }

    async findByEmail(email: string): Promise<UserResponseDto | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: userInternalSelect,
        });
        if (!user || user.isDeleted || user.status === UserStatus.DELETED) {
            return null;
        }
        const { isDeleted, ...safeUser } = user;
        void isDeleted;
        return new UserResponseDto(safeUser);
    }

    async findById(userId: string): Promise<UserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: userInternalSelect,
        });
        return this.ensureVisibleUser(user);
    }

    async listUsers(): Promise<UserResponseDto[]> {
        const users = await this.prisma.user.findMany({
            where: {
                isDeleted: false,
                status: { not: UserStatus.DELETED },
            },
            orderBy: { createdAt: 'desc' },
            select: userPublicSelect,
        });
        return users.map((user) => new UserResponseDto(user));
    }

    async updateUser(userId: string, data: UpdateUserDto): Promise<UserResponseDto> {
        const updateData: Prisma.UserUpdateInput = {};
        if (data.displayName !== undefined) {
            updateData.displayName = data.displayName;
        }
        if (data.status !== undefined) {
            updateData.status = data.status;
            if (data.status === UserStatus.DELETED) {
                updateData.isDeleted = true;
            }
        }
        if (data.bio !== undefined) {
            updateData.bio = data.bio;
        }
        if (Object.keys(updateData).length === 0) {
            throw new BadRequestException('Aucune donnée à mettre à jour');
        }

        await this.ensureUserExists(userId);
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: userPublicSelect,
        });
        return new UserResponseDto(updated);
    }

    async setUserRoles(userId: string, roleCodes: UserRole[]): Promise<UserResponseDto> {
        const role = this.ensureSingleRole(roleCodes);
        await this.ensureUserExists(userId);

        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { role, roleAssignedAt: new Date() },
            select: userPublicSelect,
        });
        return new UserResponseDto(updated);
    }

    private ensureSingleRole(roleCodes: UserRole[]): UserRole {
        if (!roleCodes || roleCodes.length === 0) {
            throw new BadRequestException('Au moins un role est requis');
        }
        if (roleCodes.length > 1) {
            throw new BadRequestException('Un seul role est autorisé');
        }
        return roleCodes[0]!;
    }

    private async ensureUserExists(userId: string): Promise<void> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, isDeleted: true, status: true },
        });
        if (!user || user.isDeleted || user.status === UserStatus.DELETED) {
            throw new NotFoundException('Utilisateur introuvable');
        }
    }

    private ensureVisibleUser(user: UserInternal | null): UserResponseDto {
        if (!user || user.isDeleted || user.status === UserStatus.DELETED) {
            throw new NotFoundException('Utilisateur introuvable');
        }
        const { isDeleted, ...safeUser } = user;
        void isDeleted;
        return new UserResponseDto(safeUser);
    }
}
