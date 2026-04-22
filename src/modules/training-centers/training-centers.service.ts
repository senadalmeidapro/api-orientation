import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTrainingCenterDto, ListTrainingCentersDto, UpdateTrainingCenterDto } from './dto';

@Injectable()
export class TrainingCentersService {
    private readonly logger = new Logger(TrainingCentersService.name);

    constructor(private readonly prisma: PrismaService) {}

    async list(dto: ListTrainingCentersDto) {
        const where: Prisma.TrainingInstitutionWhereInput = {
            ...(dto.department ? { department: dto.department } : {}),
            ...(dto.city ? { city: dto.city } : {}),
        };

        const activeOnly = dto.activeOnly !== false;
        if (activeOnly) where.isActive = true;

        if (dto.q) {
            where.OR = [
                { name: { contains: dto.q, mode: 'insensitive' } },
                { description: { contains: dto.q, mode: 'insensitive' } },
                { city: { contains: dto.q, mode: 'insensitive' } },
            ];
        }

        return this.prisma.trainingInstitution.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            ...(dto.offset !== undefined ? { skip: dto.offset } : {}),
            ...(dto.limit !== undefined ? { take: dto.limit } : {}),
        });
    }

    async getById(id: number) {
        const institution = await this.prisma.trainingInstitution.findUnique({
            where: { id },
            include: {
                careers: { include: { career: true } },
                trainingPaths: true,
            },
        });
        if (!institution) throw new NotFoundException('Centre introuvable');
        return institution;
    }

    async create(dto: CreateTrainingCenterDto) {
        const institution = await this.prisma.trainingInstitution.create({
            data: {
                name: dto.name,
                ...(dto.acronym !== undefined ? { acronym: dto.acronym } : {}),
                ...(dto.description !== undefined ? { description: dto.description } : {}),
                ...(dto.type !== undefined ? { type: dto.type } : {}),
                ...(dto.department !== undefined ? { department: dto.department } : {}),
                ...(dto.city !== undefined ? { city: dto.city } : {}),
                ...(dto.address !== undefined ? { address: dto.address } : {}),
                ...(dto.latitude !== undefined ? { latitude: dto.latitude } : {}),
                ...(dto.longitude !== undefined ? { longitude: dto.longitude } : {}),
                ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
                ...(dto.email !== undefined ? { email: dto.email } : {}),
                ...(dto.website !== undefined ? { website: dto.website } : {}),
                ...(dto.programs !== undefined
                    ? { programs: dto.programs as Prisma.InputJsonObject }
                    : {}),
                ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl } : {}),
                isActive: dto.isActive ?? true,
            },
        });
        return this.getById(institution.id);
    }

    async update(id: number, dto: UpdateTrainingCenterDto) {
        const exists = await this.prisma.trainingInstitution.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException('Centre introuvable');

        const updateData: Prisma.TrainingInstitutionUpdateInput = {
            ...(dto.name !== undefined ? { name: dto.name } : {}),
            ...(dto.acronym !== undefined ? { acronym: dto.acronym } : {}),
            ...(dto.description !== undefined ? { description: dto.description } : {}),
            ...(dto.type !== undefined ? { type: dto.type } : {}),
            ...(dto.department !== undefined ? { department: dto.department } : {}),
            ...(dto.city !== undefined ? { city: dto.city } : {}),
            ...(dto.address !== undefined ? { address: dto.address } : {}),
            ...(dto.latitude !== undefined ? { latitude: dto.latitude } : {}),
            ...(dto.longitude !== undefined ? { longitude: dto.longitude } : {}),
            ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
            ...(dto.email !== undefined ? { email: dto.email } : {}),
            ...(dto.website !== undefined ? { website: dto.website } : {}),
            ...(dto.programs !== undefined
                ? { programs: dto.programs as Prisma.InputJsonObject }
                : {}),
            ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl } : {}),
            ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        };

        await this.prisma.trainingInstitution.update({ where: { id }, data: updateData });
        return this.getById(id);
    }

    async deactivate(id: number) {
        const exists = await this.prisma.trainingInstitution.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException('Centre introuvable');
        return this.prisma.trainingInstitution.update({
            where: { id },
            data: { isActive: false },
        });
    }
}
