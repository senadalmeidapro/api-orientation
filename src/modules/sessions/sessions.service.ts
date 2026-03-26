import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { PhaseType } from '@prisma/client';
import { randomUUID } from 'crypto';
import { InputJsonValue } from '@prisma/client/runtime/client';

@Injectable()
export class SessionsService {
    constructor(private readonly prisma: PrismaService) {
    }

    private async resolveTestVersionId(explicitId?: number) {
        if (explicitId) {
            const exists = await this.prisma.testVersion.findUnique({
                where: { id: explicitId },
                select: { id: true },
            });
            if (!exists) throw new NotFoundException('TestVersion introuvable');
            return explicitId;
        }

        const active = await this.prisma.testVersion.findFirst({
            where: { isActive: true },
            orderBy: { id: 'desc' },
        });

        if (active) return active.id;

        const existing = await this.prisma.testVersion.findFirst({
            orderBy: { id: 'desc' },
        });
        if (existing) return existing.id;

        const created = await this.prisma.testVersion.create({
            data: {
                code: 'v1',
                name: 'Version 1',
                description: 'Version initiale du test RIASEC',
                isActive: true,
            },
        });

        return created.id;
    }

    async createSession(dto: CreateSessionDto) {
        const testVersionId = await this.resolveTestVersionId(dto.testVersionId);
        let userDepartment: any = undefined;
        if (!dto.department && dto.userId) {
            const user = await this.prisma.user.findUnique({
                where: { id: dto.userId },
                select: { department: true },
            });
            userDepartment = user?.department ?? undefined;
        }

        const session = await this.prisma.userTestSession.create({
            data: {
                userId: dto.userId ?? null,
                testVersionId,
                sessionToken: randomUUID(),
                shareToken: randomUUID(),
                currentPhase: PhaseType.PHASE_1,
                currentStepIndex: 0,
                currentSection: null,
                department: dto.department ?? userDepartment ?? undefined,
                deviceInfo: (dto.deviceInfo ?? undefined) as InputJsonValue,
                ipAddress: dto.ipAddress ?? undefined,
                userAgent: dto.userAgent ?? undefined,
            },
        });

        return {
            sessionId: session.id,
            sessionToken: session.sessionToken,
            shareToken: session.shareToken,
            testVersionId: session.testVersionId,
            currentPhase: session.currentPhase,
            startedAt: session.startedAt,
        };
    }

    async getByToken(sessionToken: string) {
        const session = await this.prisma.userTestSession.findUnique({
            where: { sessionToken },
        });
        if (!session) throw new NotFoundException('Session introuvable');
        return session;
    }
}
