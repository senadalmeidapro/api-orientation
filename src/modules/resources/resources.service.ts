import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ListResourcesDto } from './dto/list-resources.dto';
import { CreateResourceTranslationDto } from './dto/create-resource-translation.dto';

@Injectable()
export class ResourcesService {
    constructor(private readonly prisma: PrismaService) {
    }

    private normalizeResource(resource: any) {
        if (!resource) return resource;
        if (resource.translations?.length) {
            const t = resource.translations[0];
            return {
                ...resource,
                title: t.title,
                description: t.description,
                content: t.content,
                translationAudioUrl: t.audioUrl,
                translations: undefined,
            };
        }
        return resource;
    }

    async listResources(dto: ListResourcesDto, includeUnpublished = false) {
        const where: any = {};
        if (dto.category) where.category = dto.category;
        if (dto.tag) where.tags = { has: dto.tag };
        if (!includeUnpublished) where.isPublished = true;
        if (dto.search) {
            where.OR = [
                { title: { contains: dto.search, mode: 'insensitive' } },
                { description: { contains: dto.search, mode: 'insensitive' } },
                { content: { contains: dto.search, mode: 'insensitive' } },
            ];
        }

        const take = Math.min(dto.limit ?? 20, 100);
        const skip = dto.offset ?? 0;

        const include = dto.lang
            ? {
                translations: {
                    where: { language: { code: dto.lang } },
                    take: 1,
                },
            }
            : undefined;

        const items = await this.prisma.resource.findMany({
            where,
            take,
            skip,
            orderBy: { publishedAt: 'desc' },
            include,
        });

        return items.map((r) => this.normalizeResource(r));
    }

    async getResource(id: number, lang?: string, includeUnpublished = false) {
        const include = lang
            ? {
                translations: {
                    where: { language: { code: lang } },
                    take: 1,
                },
            }
            : undefined;

        const resource = await this.prisma.resource.findUnique({
            where: { id },
            include,
        });
        if (!resource) throw new NotFoundException('Ressource introuvable');
        if (!includeUnpublished && !resource.isPublished) {
            throw new NotFoundException('Ressource introuvable');
        }

        if (resource.isPublished) {
            await this.prisma.resource.update({
                where: { id },
                data: { viewCount: { increment: 1 } },
            });
        }

        return this.normalizeResource(resource);
    }

    async createResource(dto: CreateResourceDto) {
        const publishedAt = dto.isPublished
            ? dto.publishedAt
                ? new Date(dto.publishedAt)
                : new Date()
            : undefined;
        if (dto.publishedAt && Number.isNaN(publishedAt?.getTime() ?? 0)) {
            throw new BadRequestException('Date de publication invalide');
        }

        return this.prisma.resource.create({
            data: {
                title: dto.title,
                description: dto.description,
                content: dto.content,
                contentType: dto.contentType,
                thumbnailUrl: dto.thumbnailUrl,
                mediaUrl: dto.mediaUrl,
                category: dto.category,
                tags: dto.tags ?? [],
                author: dto.author,
                isPublished: dto.isPublished ?? false,
                publishedAt: publishedAt,
            },
        });
    }

    async updateResource(id: number, dto: UpdateResourceDto) {
        const publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : undefined;
        if (dto.publishedAt && Number.isNaN(publishedAt?.getTime() ?? 0)) {
            throw new BadRequestException('Date de publication invalide');
        }

        return this.prisma.resource.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
                content: dto.content,
                contentType: dto.contentType,
                thumbnailUrl: dto.thumbnailUrl,
                mediaUrl: dto.mediaUrl,
                category: dto.category,
                tags: dto.tags,
                author: dto.author,
                isPublished: dto.isPublished,
                publishedAt,
            },
        });
    }

    async addTranslation(resourceId: number, dto: CreateResourceTranslationDto) {
        const language = await this.prisma.language.findUnique({
            where: { code: dto.languageCode },
        });
        if (!language) throw new NotFoundException('Langue introuvable');

        return this.prisma.resourceTranslation.upsert({
            where: {
                resourceId_languageId: {
                    resourceId,
                    languageId: language.id,
                },
            },
            update: {
                title: dto.title,
                description: dto.description,
                content: dto.content,
                audioUrl: dto.audioUrl,
            },
            create: {
                resourceId,
                languageId: language.id,
                title: dto.title,
                description: dto.description,
                content: dto.content,
                audioUrl: dto.audioUrl,
            },
        });
    }

    health() {
        return { status: 'ok', module: 'resources' };
    }
}
