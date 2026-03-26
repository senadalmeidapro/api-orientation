import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
    constructor(private readonly prisma: PrismaService) {
    }

    async logAction(params: {
        userId: string;
        action: string;
        entity: string;
        entityId?: string | number;
        data?: Record<string, any>;
        ipAddress?: string;
        userAgent?: string;
    }) {
        const entityId = params.entityId !== undefined ? String(params.entityId) : undefined;
        return this.prisma.adminAuditLog.create({
            data: {
                userId: params.userId,
                action: params.action,
                entity: params.entity,
                entityId,
                data: params.data ?? undefined,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
            },
        });
    }
}
