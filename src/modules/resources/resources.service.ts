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
            where.is_published = true;
        }

        if (dto.q) {
            where.OR = [
                { title: { contains: dto.q, mode: 'insensitive' } },
                { description: { contains: dto.q, mode: 'insensitive' } },
            ];
        }

        return this.prisma.resource.findMany({
            where,
            orderBy: { created_at: 'desc' },
            skip: dto.offset ?? undefined,
            take: dto.limit ?? undefined,
        });
    }

    async getById(id: number) {
        const resource = await this.prisma.resource.findUnique({
            where: { id },
            include: { related_careers: { include: { career: true } } },
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

        const resource = await this.prisma.resource.create({
            data: {
                title: dto.title,
                description: dto.description,
                content: dto.content,
                content_type: dto.contentType,
                thumbnail_url: dto.thumbnailUrl,
                media_url: dto.mediaUrl,
                category: dto.category,
                tags: dto.tags ?? [],
                author: dto.author,
                is_published: dto.isPublished ?? false,
                published_at: publishedAt,
            },
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
        await this.prisma.careerResource.deleteMany({ where: { resource_id: id } });
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
            this.prisma.careerResource.deleteMany({ where: { resource_id: resourceId } }),
            ...(careerIds.length > 0
                ? [
                      this.prisma.careerResource.createMany({
                          data: careerIds.map((careerId) => ({
                              career_id: careerId,
                              resource_id: resourceId,
                          })),
                      }),
                  ]
                : []),
        ]);
    }
}
