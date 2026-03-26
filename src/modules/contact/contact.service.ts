import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';
import { UpdateContactRequestDto } from './dto/update-contact-request.dto';
import { ListContactRequestsDto } from './dto/list-contact-requests.dto';

@Injectable()
export class ContactService {
    constructor(private readonly prisma: PrismaService) {
    }

    async create(dto: CreateContactRequestDto, userId?: string) {
        const preferredDate = dto.preferredDate ? new Date(dto.preferredDate) : undefined;
        if (dto.preferredDate && Number.isNaN(preferredDate?.getTime() ?? 0)) {
            throw new BadRequestException('Date de rendez-vous invalide');
        }

        return this.prisma.contactRequest.create({
            data: {
                userId: userId ?? undefined,
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                requestType: dto.requestType as any,
                message: dto.message,
                preferredDate,
                preferredTime: dto.preferredTime as any,
            },
        });
    }

    async list(dto: ListContactRequestsDto) {
        const where: any = {};
        if (dto.status) where.status = dto.status;
        if (dto.requestType) where.requestType = dto.requestType as any;
        if (dto.email) where.email = dto.email;

        const limit = Math.min(dto.limit ?? 50, 200);
        return this.prisma.contactRequest.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    async listBatch(
        filters: { status?: string; requestType?: string; email?: string },
        cursor?: number,
        take = 1000,
    ) {
        const where: any = {};
        if (filters.status) where.status = filters.status;
        if (filters.requestType) where.requestType = filters.requestType as any;
        if (filters.email) where.email = filters.email;

        return this.prisma.contactRequest.findMany({
            where,
            orderBy: { id: 'asc' },
            take,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        });
    }

    async update(id: number, dto: UpdateContactRequestDto) {
        return this.prisma.contactRequest.update({
            where: { id },
            data: {
                status: dto.status,
                assignedTo: dto.assignedTo,
                response: dto.response,
            },
        });
    }

    health() {
        return { status: 'ok', module: 'contact' };
    }
}
