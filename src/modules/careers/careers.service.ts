import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';
import { GetCareersDto } from './dto/get-careers.dto';

@Injectable()
export class CareersService {
    constructor(private readonly prisma: PrismaService) {
    }

    async list(dto: GetCareersDto) {
        const where: any = { isActive: true };
        if (dto.category) where.category = dto.category;
        if (dto.q) {
            where.OR = [
                { name: { contains: dto.q, mode: 'insensitive' } },
                { description: { contains: dto.q, mode: 'insensitive' } },
            ];
        }

        return this.prisma.career.findMany({ where, orderBy: { name: 'asc' } });
    }

    async getById(id: number) {
        const career = await this.prisma.career.findUnique({ where: { id } });
        if (!career) throw new NotFoundException('Métier introuvable');
        return career;
    }

    async create(dto: CreateCareerDto) {
        return this.prisma.career.create({ data: dto });
    }

    async update(id: number, dto: UpdateCareerDto) {
        return this.prisma.career.update({ where: { id }, data: dto });
    }

    async remove(id: number) {
        return this.prisma.career.update({ where: { id }, data: { isActive: false } });
    }
}
