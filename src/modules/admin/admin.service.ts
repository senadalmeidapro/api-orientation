import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRiasecTypeDto } from './dto/create-riasec-type.dto';
import { UpdateRiasecTypeDto } from './dto/update-riasec-type.dto';
import { CreateAptitudeOptionDto } from './dto/create-aptitude-option.dto';
import { UpdateAptitudeOptionDto } from './dto/update-aptitude-option.dto';
import { ListAuditLogsDto } from './dto/list-audit-logs.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminService {
    constructor(private readonly prisma: PrismaService) {
    }

    listRiasecTypes() {
        return this.prisma.riasecTypeModel.findMany({ orderBy: { displayOrder: 'asc' } });
    }

    createRiasecType(dto: CreateRiasecTypeDto) {
        return this.prisma.riasecTypeModel.create({
            data: {
                id: dto.id,
                name: dto.name,
                slogan: dto.slogan,
                description: dto.description,
                colorHex: dto.colorHex,
                iconUrl: dto.iconUrl,
                displayOrder: dto.displayOrder ?? 0,
            },
        });
    }

    updateRiasecType(id: 'R' | 'I' | 'A' | 'S' | 'E' | 'C', dto: UpdateRiasecTypeDto) {
        return this.prisma.riasecTypeModel.update({
            where: { id: id },
            data: {
                name: dto.name,
                slogan: dto.slogan,
                description: dto.description,
                colorHex: dto.colorHex,
                iconUrl: dto.iconUrl,
                displayOrder: dto.displayOrder,
            },
        });
    }

    listAptitudeOptions() {
        return this.prisma.aptitudeResponseOption.findMany({ orderBy: { value: 'asc' } });
    }

    createAptitudeOption(dto: CreateAptitudeOptionDto) {
        return this.prisma.aptitudeResponseOption.create({
            data: {
                value: dto.value,
                label: dto.label,
                emoji: dto.emoji,
                colorCode: dto.colorCode,
            },
        });
    }

    updateAptitudeOption(id: number, dto: UpdateAptitudeOptionDto) {
        return this.prisma.aptitudeResponseOption.update({
            where: { id },
            data: {
                value: dto.value,
                label: dto.label,
                emoji: dto.emoji,
                colorCode: dto.colorCode,
            },
        });
    }

    listAuditLogs(dto: ListAuditLogsDto) {
        const where: any = {};
        if (dto.userId) where.userId = dto.userId;
        if (dto.entity) where.entity = dto.entity;
        if (dto.action) where.action = dto.action;
        const limit = Math.min(dto.limit ?? 100, 500);
        return this.prisma.adminAuditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    getRolesCatalog() {
        return {
            roles: Object.values(UserRole),
            legacyIsAdmin: true,
        };
    }

    health() {
        return { status: 'ok', module: 'admin' };
    }
}
