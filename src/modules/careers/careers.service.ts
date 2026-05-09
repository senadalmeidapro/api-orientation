import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCareerDto, ListCareersDto, UpdateCareerDto } from './dto';

@Injectable()
export class CareersService {
    private readonly logger = new Logger(CareersService.name);

    constructor(private readonly prisma: PrismaService) {}

    private resolveFormationIds(dto: { formationIds?: number[]; institutionIds?: number[] }) {
        return dto.formationIds ?? dto.institutionIds;
    }

    async list(dto: ListCareersDto) {
        const where: Prisma.CareerWhereInput = {
            ...(dto.category && { category: dto.category }),
            ...(dto.featuredOnly && { isFeatured: true }),
            ...(dto.activeOnly !== false && { isActive: true }),
            ...(dto.q && {
                OR: [
                    { name: { contains: dto.q, mode: 'insensitive' } },
                    { summary: { contains: dto.q, mode: 'insensitive' } },
                    { description: { contains: dto.q, mode: 'insensitive' } },
                ],
            }),
        };

        return this.prisma.career.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            ...(dto.offset !== undefined && { skip: dto.offset }),
            ...(dto.limit !== undefined && { take: dto.limit }),
        });
    }

    async getById(id: number) {
        const career = await this.prisma.career.findUnique({
            where: { id },
            include: {
                institutions: {
                    include: { formation: true },
                },
                resources: {
                    include: { resource: true },
                },
            },
        });

        if (!career) {
            throw new NotFoundException('Métier introuvable');
        }

        return career;
    }

    async create(dto: CreateCareerDto) {
        const career = await this.prisma.career.create({
            data: {
                name: dto.name,
                description: dto.description,
                summary: dto.summary ?? null,
                riasecCodes: dto.riasecCodes,
                localDemand: dto.localDemand ?? null,
                formationLevel: dto.formationLevel ?? null,
                salaryRangeMin: dto.salaryRangeMin ?? null,
                salaryRangeMax: dto.salaryRangeMax ?? null,
                careerPath: dto.careerPath ?? null,
                iconUrl: dto.iconUrl ?? null,
                imageUrl: dto.imageUrl ?? null,
                videoUrl: dto.videoUrl ?? null,
                category: dto.category ?? null,
                tags: dto.tags ?? [],
                isFeatured: dto.isFeatured ?? false,
                isActive: dto.isActive ?? true,
            },
        });

        const formationIds = this.resolveFormationIds(dto);
        if (formationIds !== undefined) {
            await this.replaceFormations(career.id, formationIds);
        }

        if (dto.resourceIds !== undefined) {
            await this.replaceResources(career.id, dto.resourceIds);
        }

        return this.getById(career.id);
    }

    async update(id: number, dto: UpdateCareerDto) {
        const exists = await this.prisma.career.findUnique({ where: { id } });
        if (!exists) {
            throw new NotFoundException('Métier introuvable');
        }

        const updateData: Prisma.CareerUpdateInput = {
            ...(dto.name && { name: dto.name }),
            ...(dto.description && { description: dto.description }),
            ...(dto.summary !== undefined && { summary: dto.summary }),
            ...(dto.riasecCodes && { riasecCodes: { set: dto.riasecCodes } }),
            ...(dto.localDemand !== undefined && { localDemand: dto.localDemand }),
            ...(dto.formationLevel !== undefined && { formationLevel: dto.formationLevel }),
            ...(dto.salaryRangeMin !== undefined && { salaryRangeMin: dto.salaryRangeMin }),
            ...(dto.salaryRangeMax !== undefined && { salaryRangeMax: dto.salaryRangeMax }),
            ...(dto.careerPath !== undefined && { careerPath: dto.careerPath }),
            ...(dto.iconUrl !== undefined && { iconUrl: dto.iconUrl }),
            ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
            ...(dto.videoUrl !== undefined && { videoUrl: dto.videoUrl }),
            ...(dto.category !== undefined && { category: dto.category }),
            ...(dto.tags && { tags: dto.tags }),
            ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
            ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        };

        await this.prisma.career.update({
            where: { id },
            data: updateData,
        });

        const formationIds = this.resolveFormationIds(dto);
        if (formationIds !== undefined) {
            await this.replaceFormations(id, formationIds);
        }

        if (dto.resourceIds !== undefined) {
            await this.replaceResources(id, dto.resourceIds);
        }

        return this.getById(id);
    }

    async deactivate(id: number) {
        const exists = await this.prisma.career.findUnique({ where: { id } });
        if (!exists) {
            throw new NotFoundException('Métier introuvable');
        }

        return this.prisma.career.update({
            where: { id },
            data: { isActive: false },
        });
    }

    // =========================
    // RELATIONS FORMATIONS
    // =========================

    private async replaceFormations(careerId: number, formationIds: number[]) {
        if (formationIds.length > 0) {
            const formations = await this.prisma.formation.findMany({
                where: { id: { in: formationIds } },
                select: { id: true },
            });

            if (formations.length !== formationIds.length) {
                throw new BadRequestException('Formations invalides');
            }
        }

        await this.prisma.$transaction([
            this.prisma.careerFormation.deleteMany({ where: { careerId } }),
            ...(formationIds.length > 0
                ? [
                      this.prisma.careerFormation.createMany({
                          data: formationIds.map((formationId) => ({
                              careerId,
                              formationId,
                          })),
                      }),
                  ]
                : []),
        ]);
    }

    // =========================
    // RELATIONS RESOURCES
    // =========================

    private async replaceResources(careerId: number, resourceIds: number[]) {
        if (resourceIds.length > 0) {
            const resources = await this.prisma.resource.findMany({
                where: { id: { in: resourceIds } },
                select: { id: true },
            });

            if (resources.length !== resourceIds.length) {
                throw new BadRequestException('Ressources invalides');
            }
        }

        await this.prisma.$transaction([
            this.prisma.careerResource.deleteMany({ where: { careerId } }),
            ...(resourceIds.length > 0
                ? [
                      this.prisma.careerResource.createMany({
                          data: resourceIds.map((resourceId) => ({
                              careerId,
                              resourceId,
                          })),
                      }),
                  ]
                : []),
        ]);
    }
}
