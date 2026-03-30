import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, AssessmentStatus, AssessmentType, Phase2Type, PhaseType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { randomUUID } from 'crypto';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateSessionProfileDto } from './dto/update-session-profile.dto';

const DEFAULT_DEPTH = 5;

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
        if (dto.userId) {
            const userExists = await this.prisma.user.findUnique({
                where: { id: dto.userId },
                select: { id: true },
            });
            if (!userExists) throw new NotFoundException('Utilisateur introuvable');
        }

        const session = await this.prisma.session.create({
            data: {
                sessionToken: randomUUID(),
                shareToken: randomUUID(),
                userId: dto.userId ?? undefined,
                profile: dto.profile ? (dto.profile as Prisma.InputJsonObject) : undefined,
            },
        });

        const assessmentType = dto.initialAssessmentType ?? AssessmentType.PHASE1;
        const depth = dto.depth ?? DEFAULT_DEPTH;
        const assessment = await this.createAssessment(session.id, testVersionId, {
            type: assessmentType,
            depth,
        });

        return {
            sessionId: session.id,
            sessionToken: session.sessionToken,
            shareToken: session.shareToken,
            startedAt: session.startedAt,
            assessment,
        };
    }

    async getByToken(sessionToken: string) {
        const session = await this.prisma.session.findUnique({
            where: { sessionToken },
            include: {
                user: true,
                assessments: {
                    orderBy: { startedAt: 'desc' },
                    include: {
                        result: true,
                        treasureMap: true,
                    },
                },
            },
        });
        if (!session) throw new NotFoundException('Session introuvable');
        return session;
    }

    async createAssessmentForSession(sessionToken: string, dto: CreateAssessmentDto) {
        const session = await this.prisma.session.findUnique({
            where: { sessionToken },
        });
        if (!session) throw new NotFoundException('Session introuvable');

        if (
            dto.type === AssessmentType.PHASE2_OCCUPATIONS ||
            dto.type === AssessmentType.PHASE2_APTITUDES ||
            dto.type === AssessmentType.PHASE2_PERSONALITY
        ) {
            const phase1Done = await this.prisma.assessment.findFirst({
                where: {
                    sessionId: session.id,
                    type: AssessmentType.PHASE1,
                    status: AssessmentStatus.COMPLETED,
                },
                select: { id: true },
            });
            if (!phase1Done) {
                throw new NotFoundException(
                    "Le test d'amorce doit être complété avant un test spécifique",
                );
            }
        }

        const testVersionId = await this.resolveTestVersionId(dto.testVersionId);
        return this.createAssessment(session.id, testVersionId, dto);
    }

    async listAssessments(sessionToken: string) {
        const session = await this.prisma.session.findUnique({
            where: { sessionToken },
            select: { id: true },
        });
        if (!session) throw new NotFoundException('Session introuvable');

        return this.prisma.assessment.findMany({
            where: { sessionId: session.id },
            orderBy: { startedAt: 'desc' },
            include: { result: true, treasureMap: true },
        });
    }

    async updateProfile(sessionToken: string, dto: UpdateSessionProfileDto) {
        const session = await this.prisma.session.findUnique({
            where: { sessionToken },
            include: { user: true },
        });
        if (!session) throw new NotFoundException('Session introuvable');

        const nextProfile =
            session.profile && typeof session.profile === 'object'
                ? { ...(session.profile as Record<string, unknown>), ...dto.profile }
                : dto.profile;

        const updated = await this.prisma.session.update({
            where: { id: session.id },
            data: { profile: nextProfile ? (nextProfile as Prisma.InputJsonObject) : undefined },
        });

        if (session.userId) {
            const userProfile =
                session.user?.profile && typeof session.user.profile === 'object'
                    ? { ...(session.user.profile as Record<string, unknown>), ...dto.profile }
                    : dto.profile;
            await this.prisma.user.update({
                where: { id: session.userId },
                data: {
                    profile: userProfile ? (userProfile as Prisma.InputJsonObject) : undefined,
                },
            });
        }

        return updated;
    }

    private resolvePhaseForType(type: AssessmentType) {
        if (type === AssessmentType.PHASE1 || type === AssessmentType.FULL) {
            return { phase: PhaseType.PHASE_1, section: null };
        }
        if (type === AssessmentType.PHASE2_OCCUPATIONS) {
            return { phase: PhaseType.PHASE_2, section: Phase2Type.OCCUPATIONS };
        }
        if (type === AssessmentType.PHASE2_APTITUDES) {
            return { phase: PhaseType.PHASE_2, section: Phase2Type.APTITUDES };
        }
        return { phase: PhaseType.PHASE_2, section: Phase2Type.PERSONALITY };
    }

    private async createAssessment(
        sessionId: number,
        testVersionId: number,
        dto: CreateAssessmentDto,
    ) {
        const depth = dto.depth ?? DEFAULT_DEPTH;
        const { phase, section } = this.resolvePhaseForType(dto.type);
        return this.prisma.assessment.create({
            data: {
                sessionId,
                testVersionId,
                type: dto.type,
                depth,
                status: AssessmentStatus.IN_PROGRESS,
                currentPhase: phase,
                currentSection: section,
                currentStepIndex: 0,
                completionPercentage: 0,
            },
        });
    }
}
