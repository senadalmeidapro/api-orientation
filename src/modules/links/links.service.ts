import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    CreateLinkCategoryDto,
    CreateLinkDto,
    ListLinksDto,
    UpdateLinkCategoryDto,
    UpdateLinkDto,
} from './dto';

@Injectable()
export class LinksService {
    private readonly logger = new Logger(LinksService.name);

    constructor(private readonly prisma: PrismaService) {}

    async list(dto: ListLinksDto) {
        const where = dto.categoryId ? { id: dto.categoryId } : undefined;

        return this.prisma.linkCategory.findMany({
            ...(where ? { where } : {}),
            include: { links: true },
            orderBy: { name: 'asc' },
        });
    }

    async createCategory(dto: CreateLinkCategoryDto) {
        return this.prisma.linkCategory.create({ data: { name: dto.name } });
    }

    async updateCategory(id: number, dto: UpdateLinkCategoryDto) {
        const exists = await this.prisma.linkCategory.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException('Categorie introuvable');
        return this.prisma.linkCategory.update({
            where: { id },
            data: { name: dto.name ?? exists.name },
        });
    }

    async deleteCategory(id: number) {
        const exists = await this.prisma.linkCategory.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException('Categorie introuvable');
        return this.prisma.linkCategory.delete({ where: { id } });
    }

    async createLink(dto: CreateLinkDto) {
        const category = await this.prisma.linkCategory.findUnique({
            where: { id: dto.categoryId },
        });
        if (!category) throw new NotFoundException('Categorie introuvable');

        const data = {
            categoryId: dto.categoryId,
            title: dto.title,
            ...(dto.url !== undefined ? { url: dto.url } : {}),
            ...(dto.note !== undefined ? { note: dto.note } : {}),
        };

        return this.prisma.link.create({
            data,
        });
    }

    async updateLink(id: number, dto: UpdateLinkDto) {
        const link = await this.prisma.link.findUnique({ where: { id } });
        if (!link) throw new NotFoundException('Lien introuvable');

        if (dto.categoryId !== undefined) {
            const category = await this.prisma.linkCategory.findUnique({
                where: { id: dto.categoryId },
            });
            if (!category) throw new NotFoundException('Categorie introuvable');
        }

        return this.prisma.link.update({
            where: { id },
            data: {
                categoryId: dto.categoryId ?? link.categoryId,
                title: dto.title ?? link.title,
                url: dto.url ?? link.url,
                note: dto.note ?? link.note,
            },
        });
    }

    async deleteLink(id: number) {
        const exists = await this.prisma.link.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException('Lien introuvable');
        return this.prisma.link.delete({ where: { id } });
    }
}
