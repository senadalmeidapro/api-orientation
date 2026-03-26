import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOutcomeDto } from './dto/create-outcome.dto';
import { ListOutcomesDto } from './dto/list-outcomes.dto';

@Injectable()
export class OutcomesService {
    constructor(private readonly prisma: PrismaService) {
    }

    private parseRange(dto: { from?: string; to?: string }) {
        const from = dto.from ? new Date(dto.from) : undefined;
        const to = dto.to ? new Date(dto.to) : undefined;
        if (from && Number.isNaN(from.getTime()))
            throw new BadRequestException('Date from invalide');
        if (to && Number.isNaN(to.getTime())) throw new BadRequestException('Date to invalide');
        return { from, to };
    }

    async create(dto: CreateOutcomeDto, userId?: string) {
        if (!userId) throw new BadRequestException('Utilisateur requis');

        const career = await this.prisma.career.findUnique({
            where: { id: dto.careerId },
            select: { id: true },
        });
        if (!career) throw new NotFoundException('Métier introuvable');

        return this.prisma.userOutcome.create({
            data: {
                userId,
                careerId: dto.careerId,
                status: dto.status,
                sector: dto.sector,
                salaryRange: dto.salaryRange ?? undefined,
                delayToOutcome: dto.delayToOutcome,
            },
        });
    }

    async list(dto: ListOutcomesDto) {
        const where: any = {};
        if (dto.userId) where.userId = dto.userId;
        if (dto.careerId) where.careerId = dto.careerId;
        if (dto.status) where.status = dto.status;
        if (dto.from || dto.to) {
            const { from, to } = this.parseRange(dto);
            where.createdAt = {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
            };
        }

        const limit = Math.min(dto.limit ?? 100, 500);
        return this.prisma.userOutcome.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    health() {
        return { status: 'ok', module: 'outcomes' };
    }
}
