import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTrainingPathDto, ListTrainingPathsDto, UpdateTrainingPathDto } from './dto';

@Injectable()
export class TrainingPathsService {
    private readonly logger = new Logger(TrainingPathsService.name);

    constructor(private readonly prisma: PrismaService) {}

    async list(dto: ListTrainingPathsDto) {
        const where: Prisma.TrainingPathWhereInput = {
            ...(dto.careerId ? { career_id: dto.careerId } : {}),
            ...(dto.institutionId ? { institution_id: dto.institutionId } : {}),
        };

        const activeOnly = dto.activeOnly !== false;
        if (activeOnly) where.is_active = true;

        return this.prisma.trainingPath.findMany({
            where,
            include: { career: true, institution: true },
            orderBy: { created_at: 'desc' },
            skip: dto.offset ?? undefined,
            take: dto.limit ?? undefined,
        });
    }

    async getById(id: number) {
        const path = await this.prisma.trainingPath.findUnique({
            where: { id },
            include: { career: true, institution: true },
        });
        if (!path) throw new NotFoundException('Parcours introuvable');
        return path;
    }

    async create(dto: CreateTrainingPathDto) {
        await this.assertRelations(dto.careerId, dto.institutionId);

        const path = await this.prisma.trainingPath.create({
            data: {
                name: dto.name,
                description: dto.description,
                level: dto.level,
                duration_months: dto.durationMonths,
                cost_min: dto.costMin,
                cost_max: dto.costMax,
                career_id: dto.careerId,
                institution_id: dto.institutionId,
                is_active: dto.isActive ?? true,
            },
        });

        return this.getById(path.id);
    }

    async update(id: number, dto: UpdateTrainingPathDto) {
        const exists = await this.prisma.trainingPath.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException('Parcours introuvable');

        await this.assertRelations(
            dto.careerId ?? exists.career_id ?? undefined,
            dto.institutionId ?? exists.institution_id ?? undefined,
        );

        const updateData: Prisma.TrainingPathUpdateInput = {
            ...(dto.name !== undefined ? { name: dto.name } : {}),
            ...(dto.description !== undefined ? { description: dto.description } : {}),
            ...(dto.level !== undefined ? { level: dto.level } : {}),
            ...(dto.durationMonths !== undefined ? { durationMonths: dto.durationMonths } : {}),
            ...(dto.costMin !== undefined ? { costMin: dto.costMin } : {}),
            ...(dto.costMax !== undefined ? { costMax: dto.costMax } : {}),
            ...(dto.careerId !== undefined ? { careerId: dto.careerId } : {}),
            ...(dto.institutionId !== undefined ? { institutionId: dto.institutionId } : {}),
            ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        };

        await this.prisma.trainingPath.update({ where: { id }, data: updateData });
        return this.getById(id);
    }

    async deactivate(id: number) {
        const exists = await this.prisma.trainingPath.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException('Parcours introuvable');
        return this.prisma.trainingPath.update({ where: { id }, data: { is_active: false } });
    }

    private async assertRelations(careerId?: number, institutionId?: number) {
        if (careerId !== undefined) {
            const career = await this.prisma.career.findUnique({ where: { id: careerId } });
            if (!career) throw new BadRequestException('Metier introuvable');
        }
        if (institutionId !== undefined) {
            const institution = await this.prisma.trainingInstitution.findUnique({
                where: { id: institutionId },
            });
            if (!institution) throw new BadRequestException('Centre introuvable');
        }
    }
}
