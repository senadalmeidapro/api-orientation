import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';

@Injectable()
export class LocalizationService {
    constructor(private readonly prisma: PrismaService) {
    }

    async listLanguages(activeOnly = true) {
        return this.prisma.language.findMany({
            where: activeOnly ? { isActive: true } : {},
            orderBy: { name: 'asc' },
        });
    }

    async createLanguage(dto: CreateLanguageDto) {
        return this.prisma.language.create({ data: dto });
    }

    async updateLanguage(id: number, dto: UpdateLanguageDto) {
        return this.prisma.language.update({ where: { id }, data: dto });
    }

    health() {
        return { status: 'ok', module: 'localization' };
    }
}
