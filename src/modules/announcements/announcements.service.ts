import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ListAnnouncementsDto } from './dto/list-announcements.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { CreateAnnouncementTranslationDto } from './dto/create-announcement-translation.dto';

@Injectable()
export class AnnouncementsService {
    constructor(private readonly prisma: PrismaService) {
    }

    private normalizeAnnouncement(a: any) {
        if (!a) return a;
        if (a.translations?.length) {
            const t = a.translations[0];
            return {
                ...a,
                title: t.title,
                content: t.content,
                excerpt: t.excerpt ?? a.excerpt,
                translationAudioUrl: t.audioUrl,
                translations: undefined,
            };
        }
        return a;
    }

    async listAnnouncements(dto: ListAnnouncementsDto, includeInactive = false) {
        const now = new Date();
        const where: any = {};
        if (dto.type) where.type = dto.type;
        if (dto.targetAudience) where.targetAudience = dto.targetAudience;
        if (!includeInactive) {
            where.isActive = true;
            where.AND = [
                { OR: [{ startDate: null }, { startDate: { lte: now } }] },
                { OR: [{ endDate: null }, { endDate: { gte: now } }] },
            ];
        }
        if (dto.from || dto.to) {
            const from = dto.from ? new Date(dto.from) : undefined;
            const to = dto.to ? new Date(dto.to) : undefined;
            if (from && Number.isNaN(from.getTime()))
                throw new BadRequestException('Date from invalide');
            if (to && Number.isNaN(to.getTime())) throw new BadRequestException('Date to invalide');
            where.createdAt = {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
            };
        }

        const include = dto.lang
            ? {
                translations: {
                    where: { language: { code: dto.lang } },
                    take: 1,
                },
            }
            : undefined;

        const items = await this.prisma.announcement.findMany({
            where,
            include,
            orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        });

        return items.map((a) => this.normalizeAnnouncement(a));
    }

    async getAnnouncement(id: number, lang?: string, includeInactive = false) {
        const include = lang
            ? {
                translations: {
                    where: { language: { code: lang } },
                    take: 1,
                },
            }
            : undefined;

        const ann = await this.prisma.announcement.findUnique({ where: { id }, include });
        if (!ann) throw new NotFoundException('Annonce introuvable');
        if (!includeInactive && !ann.isActive) throw new NotFoundException('Annonce introuvable');
        return this.normalizeAnnouncement(ann);
    }

    async createAnnouncement(dto: CreateAnnouncementDto) {
        const startDate = dto.startDate ? new Date(dto.startDate) : undefined;
        const endDate = dto.endDate ? new Date(dto.endDate) : undefined;
        const publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : undefined;
        if (dto.startDate && Number.isNaN(startDate?.getTime() ?? 0)) {
            throw new BadRequestException('Date de debut invalide');
        }
        if (dto.endDate && Number.isNaN(endDate?.getTime() ?? 0)) {
            throw new BadRequestException('Date de fin invalide');
        }

        return this.prisma.announcement.create({
            data: {
                title: dto.title,
                content: dto.content,
                excerpt: dto.excerpt,
                type: dto.type,
                priority: dto.priority ?? 0,
                imageUrl: dto.imageUrl,
                linkUrl: dto.linkUrl,
                targetAudience: dto.targetAudience,
                startDate,
                endDate,
                isActive: dto.isActive ?? true,
                publishedAt,
            },
        });
    }

    async updateAnnouncement(id: number, dto: UpdateAnnouncementDto) {
        const startDate = dto.startDate ? new Date(dto.startDate) : undefined;
        const endDate = dto.endDate ? new Date(dto.endDate) : undefined;
        const publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : undefined;
        if (dto.startDate && Number.isNaN(startDate?.getTime() ?? 0)) {
            throw new BadRequestException('Date de debut invalide');
        }
        if (dto.endDate && Number.isNaN(endDate?.getTime() ?? 0)) {
            throw new BadRequestException('Date de fin invalide');
        }

        return this.prisma.announcement.update({
            where: { id },
            data: {
                title: dto.title,
                content: dto.content,
                excerpt: dto.excerpt,
                type: dto.type,
                priority: dto.priority,
                imageUrl: dto.imageUrl,
                linkUrl: dto.linkUrl,
                targetAudience: dto.targetAudience,
                startDate,
                endDate,
                isActive: dto.isActive,
                publishedAt,
            },
        });
    }

    async addTranslation(announcementId: number, dto: CreateAnnouncementTranslationDto) {
        const language = await this.prisma.language.findUnique({
            where: { code: dto.languageCode },
        });
        if (!language) throw new NotFoundException('Langue introuvable');

        return this.prisma.announcementTranslation.upsert({
            where: {
                announcementId_languageId: {
                    announcementId,
                    languageId: language.id,
                },
            },
            update: {
                title: dto.title,
                content: dto.content,
                excerpt: dto.excerpt,
                audioUrl: dto.audioUrl,
            },
            create: {
                announcementId,
                languageId: language.id,
                title: dto.title,
                content: dto.content,
                excerpt: dto.excerpt,
                audioUrl: dto.audioUrl,
            },
        });
    }

    health() {
        return { status: 'ok', module: 'announcements' };
    }
}
