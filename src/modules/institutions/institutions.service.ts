import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ListInstitutionsDto } from './dto/list-institutions.dto';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { CreateInstitutionTranslationDto } from './dto/create-institution-translation.dto';

@Injectable()
export class InstitutionsService {
    constructor(private readonly prisma: PrismaService) {
    }

    private normalizeInstitution(inst: any) {
        if (!inst) return inst;
        if (inst.translations?.length) {
            const t = inst.translations[0];
            return {
                ...inst,
                name: t.name,
                description: t.description ?? inst.description,
                translations: undefined,
            };
        }
        return inst;
    }

    async listInstitutions(dto: ListInstitutionsDto, includeInactive = false) {
        const where: any = {};
        if (!includeInactive) where.isActive = true;
        if (dto.department) where.department = dto.department;
        if (dto.city) where.city = dto.city;
        if (dto.type) where.type = dto.type;
        if (dto.search) {
            where.OR = [
                { name: { contains: dto.search, mode: 'insensitive' } },
                { acronym: { contains: dto.search, mode: 'insensitive' } },
            ];
        }

        const include = dto.lang
            ? {
                translations: {
                    where: {language: {code: dto.lang}},
                    take: 1,
                },
            }
            : undefined;

        const take = Math.min(dto.limit ?? 20, 100);
        const skip = dto.offset ?? 0;

        const items = await this.prisma.trainingInstitution.findMany({
            where,
            include,
            take,
            skip,
            orderBy: { name: 'asc' },
        });

        return items.map((i) => this.normalizeInstitution(i));
    }

    async getInstitution(id: number, lang?: string, includeInactive = false) {
        const include = lang
            ? {
                translations: {
                    where: {language: {code: lang}},
                    take: 1,
                },
            }
            : undefined;

        const inst = await this.prisma.trainingInstitution.findUnique({ where: { id }, include });
        if (!inst) throw new NotFoundException('Etablissement introuvable');
        if (!includeInactive && !inst.isActive)
            throw new NotFoundException('Etablissement introuvable');
        return this.normalizeInstitution(inst);
    }

    async createInstitution(dto: CreateInstitutionDto) {
        return this.prisma.trainingInstitution.create({
            data: {
                name: dto.name,
                acronym: dto.acronym,
                description: dto.description,
                type: dto.type,
                department: dto.department,
                city: dto.city,
                address: dto.address,
                phone: dto.phone,
                email: dto.email,
                website: dto.website,
                programs: dto.programs,
                logoUrl: dto.logoUrl,
                isActive: dto.isActive ?? true,
            },
        });
    }

    async updateInstitution(id: number, dto: UpdateInstitutionDto) {
        return this.prisma.trainingInstitution.update({
            where: { id },
            data: {
                name: dto.name,
                acronym: dto.acronym,
                description: dto.description,
                type: dto.type,
                department: dto.department,
                city: dto.city,
                address: dto.address,
                phone: dto.phone,
                email: dto.email,
                website: dto.website,
                programs: dto.programs,
                logoUrl: dto.logoUrl,
                isActive: dto.isActive,
            },
        });
    }

    async addTranslation(institutionId: number, dto: CreateInstitutionTranslationDto) {
        const language = await this.prisma.language.findUnique({
            where: { code: dto.languageCode },
        });
        if (!language) throw new NotFoundException('Langue introuvable');

        return this.prisma.trainingInstitutionTranslation.upsert({
            where: {
                institutionId_languageId: {
                    institutionId,
                    languageId: language.id,
                },
            },
            update: {
                name: dto.name,
                description: dto.description,
            },
            create: {
                institutionId,
                languageId: language.id,
                name: dto.name,
                description: dto.description,
            },
        });
    }

    health() {
        return { status: 'ok', module: 'institutions' };
    }
}
