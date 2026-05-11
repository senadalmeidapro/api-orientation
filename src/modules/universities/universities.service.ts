import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
    CreateUniversityDto,
    UpdateUniversityDto,
    CreateFormationDto,
    UpdateFormationDto,
    CreateScholarshipDto,
    UpdateScholarshipDto,
} from './dto';
import type { InputJsonObject } from '@prisma/client/runtime/client';

@Injectable()
export class UniversitiesService {
    constructor(private prisma: PrismaService) {}

    // ===== UNIVERSITIES =====
    async createUniversity(dto: CreateUniversityDto) {
        const { mediaUrls, ...data } = dto;
        return this.prisma.university.create({
            data: {
                name: data.name,
                acronym: data.acronym,
                description: data.description,
                phone: data.phone ?? null,
                email: data.email ?? null,
                website: data.website,
                department: data.department ?? null,
                city: data.city ?? null,
                address: data.address ?? null,
                latitude: data.latitude ?? null,
                longitude: data.longitude ?? null,
                coverUrl: data.coverUrl ?? null,
                logoUrl: data.logoUrl ?? null,
                formationUrls: data.formationUrls,
                isActive: data.isActive ?? true,

                ...(mediaUrls && {
                    media: {
                        createMany: {
                            data: mediaUrls.map((url, idx) => ({
                                mediaUrl: url,
                                order: idx,
                            })),
                        },
                    },
                }),
            },
            include: { media: true },
        });
    }

    async findAllUniversities() {
        return this.prisma.university.findMany({
            where: { isActive: true },
            include: {
                formations: true,
                media: true,
            },
        });
    }

    async findUniversityById(id: number) {
        return this.prisma.university.findUnique({
            where: { id },
            include: {
                formations: true,
                media: true,
                scholarships: {
                    include: { scholarship: true },
                },
            },
        });
    }

    async findUniversityByAcronymOrNameOrFormation(query: string) {
        return this.prisma.university.findMany({
            where: {
                isActive: true,
                OR: [
                    { acronym: { contains: query, mode: 'insensitive' } },
                    { name: { contains: query, mode: 'insensitive' } },
                    {
                        formations: {
                            some: {
                                title: { contains: query, mode: 'insensitive' },
                            },
                        },
                    },
                ],
            },
            include: {
                formations: true,
                media: true,
            },
        });
    }

    async updateUniversity(id: number, dto: UpdateUniversityDto) {
        const { mediaUrls, ...data } = dto;

        if (mediaUrls) {
            // Clear old media and add new ones
            await this.prisma.universityMedia.deleteMany({
                where: { universityId: id },
            });
        }

        return this.prisma.university.update({
            where: { id },
            data: {
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.acronym !== undefined ? { acronym: data.acronym } : {}),
                ...(data.description !== undefined ? { description: data.description } : {}),
                ...(data.phone !== undefined ? { phone: data.phone } : {}),
                ...(data.email !== undefined ? { email: data.email } : {}),
                ...(data.website !== undefined ? { website: data.website } : {}),
                ...(data.department !== undefined ? { department: data.department } : {}),
                ...(data.city !== undefined ? { city: data.city } : {}),
                ...(data.address !== undefined ? { address: data.address } : {}),
                ...(data.latitude !== undefined ? { latitude: data.latitude } : {}),
                ...(data.longitude !== undefined ? { longitude: data.longitude } : {}),
                ...(data.coverUrl !== undefined ? { coverUrl: data.coverUrl } : {}),
                ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl } : {}),
                ...(data.formationUrls !== undefined ? { formationUrls: data.formationUrls } : {}),
                ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
                ...(mediaUrls && {
                    media: {
                        createMany: {
                            data: mediaUrls.map((url, idx) => ({
                                mediaUrl: url,
                                order: idx,
                            })),
                        },
                    },
                }),
            },
            include: { media: true },
        });
    }

    async deleteUniversity(id: number) {
        return this.prisma.university.delete({
            where: { id },
        });
    }

    // ===== FORMATIONS =====
    async createFormation(dto: CreateFormationDto) {
        return this.prisma.formation.create({
            data: {
                title: dto.title,
                description: dto.description,
                duration: dto.duration,
                degree: dto.degree,
                field: dto.field ?? null,
                costMin: dto.costMin ?? null,
                costMax: dto.costMax ?? null,
                programs: (dto.programs as InputJsonObject) ?? {},
                universityId: dto.universityAcronym,
            },
            include: { university: true },
        });
    }

    async findAllFormations() {
        return this.prisma.formation.findMany({
            where: { isActive: true },
            include: { university: true },
        });
    }

    async findAllFormationsByUniversity(universityId?: number) {
        return this.prisma.formation.findMany({
            where: {
                isActive: true,
                ...(universityId && { universityId }),
            },
            include: { university: true },
        });
    }

    async findFormationById(id: number) {
        return this.prisma.formation.findUnique({
            where: { id },
            include: { university: true },
        });
    }

    async findFormationByTitleOrDegreeOrField(query: string) {
        return this.prisma.formation.findMany({
            where: {
                isActive: true,
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { degree: { contains: query, mode: 'insensitive' } },
                    { field: { contains: query, mode: 'insensitive' } },
                ],
            },
            include: { university: true },
        });
    }

    async updateFormation(id: number, dto: UpdateFormationDto) {
        return this.prisma.formation.update({
            where: { id },
            data: {
                ...(dto.title !== undefined ? { title: dto.title } : {}),
                ...(dto.description !== undefined ? { description: dto.description } : {}),
                ...(dto.duration !== undefined ? { duration: dto.duration } : {}),
                ...(dto.degree !== undefined ? { degree: dto.degree } : {}),
                ...(dto.field !== undefined ? { field: dto.field } : {}),
                ...(dto.costMin !== undefined ? { costMin: dto.costMin } : {}),
                ...(dto.costMax !== undefined ? { costMax: dto.costMax } : {}),
                ...(dto.programs !== undefined
                    ? { programs: dto.programs as InputJsonObject }
                    : {}),
                ...(dto.universityAcronym !== undefined
                    ? { universityId: dto.universityAcronym }
                    : {}),
            },
            include: { university: true },
        });
    }

    async deleteFormation(id: number) {
        return this.prisma.formation.delete({
            where: { id },
        });
    }

    // ===== SCHOLARSHIPS =====
    async createScholarship(dto: CreateScholarshipDto) {
        const { universityIds, ...data } = dto;
        return this.prisma.scholarship.create({
            data: {
                title: data.title,
                description: data.description,
                provider: data.provider,
                amount: data.amount ?? null,
                benefits: data.benefits,
                conditions: data.conditions,
                level: data.level,
                field: data.field ?? null,
                country: data.country ?? null,
                applicationUrl: data.applicationUrl ?? null,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                ...(universityIds && {
                    universities: {
                        createMany: {
                            data: universityIds.map((universityId) => ({
                                universityId,
                            })),
                        },
                    },
                }),
            },
            include: { universities: { include: { university: true } } },
        });
    }

    async findAllScholarships() {
        return this.prisma.scholarship.findMany({
            where: { isActive: true },
            include: { universities: { include: { university: true } } },
        });
    }

    async findScholarshipById(id: number) {
        return this.prisma.scholarship.findUnique({
            where: { id },
            include: { universities: { include: { university: true } } },
        });
    }

    async findScholarshipByTitleOrProviderOrField(query: string) {
        return this.prisma.scholarship.findMany({
            where: {
                isActive: true,
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { provider: { contains: query, mode: 'insensitive' } },
                    { field: { contains: query, mode: 'insensitive' } },
                ],
            },
            include: { universities: { include: { university: true } } },
        });
    }

    async updateScholarship(id: number, dto: UpdateScholarshipDto) {
        const { universityIds, ...data } = dto;

        if (universityIds) {
            // Update scholarships associations
            await this.prisma.universityScholarship.deleteMany({
                where: { scholarshipId: id },
            });
        }

        return this.prisma.scholarship.update({
            where: { id },
            data: {
                ...(data.title !== undefined ? { title: data.title } : {}),
                ...(data.description !== undefined ? { description: data.description } : {}),
                ...(data.provider !== undefined ? { provider: data.provider } : {}),
                ...(data.amount !== undefined ? { amount: data.amount } : {}),
                ...(data.benefits !== undefined ? { benefits: data.benefits } : {}),
                ...(data.conditions !== undefined ? { conditions: data.conditions } : {}),
                ...(data.level !== undefined ? { level: data.level } : {}),
                ...(data.field !== undefined ? { field: data.field } : {}),
                ...(data.country !== undefined ? { country: data.country } : {}),
                ...(data.applicationUrl !== undefined
                    ? { applicationUrl: data.applicationUrl }
                    : {}),
                ...(data.startDate !== undefined ? { startDate: new Date(data.startDate) } : {}),
                ...(data.endDate !== undefined ? { endDate: new Date(data.endDate) } : {}),
                ...(universityIds && {
                    universities: {
                        createMany: {
                            data: universityIds.map((universityId) => ({
                                universityId,
                            })),
                        },
                    },
                }),
            },
            include: { universities: { include: { university: true } } },
        });
    }

    async deleteScholarship(id: number) {
        return this.prisma.scholarship.delete({
            where: { id },
        });
    }

    // ===== SCHOLARSHIP-UNIVERSITY ASSOCIATIONS =====
    async addScholarshipToUniversity(universityId: number, scholarshipId: number) {
        return this.prisma.universityScholarship.create({
            data: { universityId, scholarshipId },
            include: { university: true, scholarship: true },
        });
    }

    async removeScholarshipFromUniversity(universityId: number, scholarshipId: number) {
        return this.prisma.universityScholarship.delete({
            where: {
                universityId_scholarshipId: {
                    universityId,
                    scholarshipId,
                },
            },
        });
    }
}
