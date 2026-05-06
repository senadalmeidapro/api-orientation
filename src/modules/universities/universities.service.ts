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

@Injectable()
export class UniversitiesService {
    constructor(private prisma: PrismaService) {}

    // ===== UNIVERSITIES =====
    async createUniversity(dto: CreateUniversityDto) {
        const { mediaUrls, ...data } = dto;
        return this.prisma.university.create({
            data: {
                ...data,
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
                ...data,
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
            data: dto,
            include: { university: true },
        });
    }

    async findAllFormations(universityId?: number) {
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

    async updateFormation(id: number, dto: UpdateFormationDto) {
        return this.prisma.formation.update({
            where: { id },
            data: dto,
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
                ...data,
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
                ...data,
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
