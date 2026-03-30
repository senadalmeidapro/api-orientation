import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { PhaseType } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class SessionsService {
    constructor(private readonly prisma: PrismaService) {}

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
        const session = await this.prisma.testSession.create({
            data: {
                testVersionId,
                sessionToken: randomUUID(),
                shareToken: randomUUID(),
                currentPhase: PhaseType.PHASE_1,
                currentStepIndex: 0,
                currentSection: null,
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
        const session = await this.prisma.testSession.findUnique({
            where: { sessionToken },
        });
        if (!session) throw new NotFoundException('Session introuvable');
        return session;
    }
}
