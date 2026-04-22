import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateResourceDto, ListResourcesDto, UpdateResourceDto } from './dto';

@Injectable()
export class ResourcesService {
    private readonly logger = new Logger(ResourcesService.name);

    constructor(private readonly prisma: PrismaService) {}

    async list(dto: ListResourcesDto) {
        const where: Prisma.ResourceWhereInput = {
            ...(dto.category ? { category: dto.category } : {}),
        };

        const publishedOnly = dto.publishedOnly !== false;
        if (publishedOnly) {
            where.isPublished = true;
        }

        if (dto.q) {
            where.OR = [
                { title: { contains: dto.q, mode: 'insensitive' } },
                { description: { contains: dto.q, mode: 'insensitive' } },
            ];
        }

        return this.prisma.resource.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            ...(dto.offset !== undefined ? { skip: dto.offset } : {}),
            ...(dto.limit !== undefined ? { take: dto.limit } : {}),
        });
    }

    async getById(id: number) {
        const resource = await this.prisma.resource.findUnique({
            where: { id },
            include: { relatedCareers: { include: { career: true } } },
        });
        if (!resource) throw new NotFoundException('Ressource introuvable');
        return resource;
    }

    async create(dto: CreateResourceDto) {
        const publishedAt = dto.isPublished
            ? dto.publishedAt
                ? new Date(dto.publishedAt)
                : new Date()
            : dto.publishedAt
              ? new Date(dto.publishedAt)
              : undefined;

        const createData: Prisma.ResourceCreateInput = {
            title: dto.title,
            description: dto.description,
            content: dto.content,
            contentType: dto.contentType,
            tags: dto.tags ?? [],
            isPublished: dto.isPublished ?? false,
            ...(dto.thumbnailUrl !== undefined ? { thumbnailUrl: dto.thumbnailUrl } : {}),
            ...(dto.mediaUrl !== undefined ? { mediaUrl: dto.mediaUrl } : {}),
            ...(dto.category !== undefined ? { category: dto.category } : {}),
            ...(dto.author !== undefined ? { author: dto.author } : {}),
            ...(publishedAt !== undefined ? { publishedAt } : {}),
        };

        const resource = await this.prisma.resource.create({
            data: createData,
        });

        if (dto.careerIds !== undefined) {
            await this.replaceCareers(resource.id, dto.careerIds);
        }

        return this.getById(resource.id);
    }

    async update(id: number, dto: UpdateResourceDto) {
        const exists = await this.prisma.resource.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException('Ressource introuvable');

        const publishedAt = dto.isPublished
            ? dto.publishedAt
                ? new Date(dto.publishedAt)
                : new Date()
            : dto.publishedAt
              ? new Date(dto.publishedAt)
              : undefined;

        const updateData: Prisma.ResourceUpdateInput = {
            ...(dto.title !== undefined ? { title: dto.title } : {}),
            ...(dto.description !== undefined ? { description: dto.description } : {}),
            ...(dto.content !== undefined ? { content: dto.content } : {}),
            ...(dto.contentType !== undefined ? { contentType: dto.contentType } : {}),
            ...(dto.thumbnailUrl !== undefined ? { thumbnailUrl: dto.thumbnailUrl } : {}),
            ...(dto.mediaUrl !== undefined ? { mediaUrl: dto.mediaUrl } : {}),
            ...(dto.category !== undefined ? { category: dto.category } : {}),
            ...(dto.tags !== undefined ? { tags: dto.tags ?? [] } : {}),
            ...(dto.author !== undefined ? { author: dto.author } : {}),
            ...(dto.isPublished !== undefined ? { isPublished: dto.isPublished } : {}),
            ...(publishedAt !== undefined ? { publishedAt } : {}),
        };

        await this.prisma.resource.update({ where: { id }, data: updateData });

        if (dto.careerIds !== undefined) {
            await this.replaceCareers(id, dto.careerIds);
        }

        return this.getById(id);
    }

    async remove(id: number) {
        const exists = await this.prisma.resource.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException('Ressource introuvable');
        await this.prisma.careerResource.deleteMany({ where: { resourceId: id } });
        return this.prisma.resource.delete({ where: { id } });
    }

    private async replaceCareers(resourceId: number, careerIds: number[]) {
        if (careerIds.length > 0) {
            const careers = await this.prisma.career.findMany({
                where: { id: { in: careerIds } },
                select: { id: true },
            });
            if (careers.length !== careerIds.length) {
                throw new BadRequestException('Metiers invalides');
            }
        }

        await this.prisma.$transaction([
            this.prisma.careerResource.deleteMany({ where: { resourceId } }),
            ...(careerIds.length > 0
                ? [
                      this.prisma.careerResource.createMany({
                          data: careerIds.map((careerId) => ({
                              careerId,
                              resourceId,
                          })),
                      }),
                  ]
                : []),
        ]);
    }
}
