import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BadgeRarity, UserTestSession } from '@prisma/client';

@Injectable()
export class BadgesService {
    constructor(private readonly prisma: PrismaService) {
    }

    private defaultBadges = [
        {
            code: 'PHASE1_COMPLETED',
            name: 'Explorateur',
            description: 'Tu as termine la phase 1 du test.',
            emoji: 'compass',
            rarity: BadgeRarity.COMMON,
            pointsValue: 20,
            unlockCondition: { type: 'phase_completion', phase: 1 },
        },
        {
            code: 'PHASE2_COMPLETED',
            name: 'Analyste',
            description: 'Tu as termine la phase 2 du test.',
            emoji: 'brain',
            rarity: BadgeRarity.RARE,
            pointsValue: 30,
            unlockCondition: { type: 'phase_completion', phase: 2 },
        },
        {
            code: 'TEST_COMPLETED',
            name: 'Orientation',
            description: 'Tu as obtenu ton profil complet.',
            emoji: 'flag',
            rarity: BadgeRarity.EPIC,
            pointsValue: 50,
            unlockCondition: { type: 'test_completed' },
        },
        {
            code: 'TREASURE_MAP',
            name: 'Carte au Tresor',
            description: 'Tu as genere ta carte au tresor.',
            emoji: 'map',
            rarity: BadgeRarity.RARE,
            pointsValue: 20,
            unlockCondition: { type: 'treasure_map' },
        },
    ];

    private async ensureDefaults() {
        await Promise.all(
            this.defaultBadges.map((badge) =>
                this.prisma.badge.upsert({
                    where: { code: badge.code },
                    update: {},
                    create: badge,
                }),
            ),
        );
    }

    async listBadges() {
        await this.ensureDefaults();
        return this.prisma.badge.findMany({ orderBy: { pointsValue: 'desc' } });
    }

    async getUserBadges(userId: string) {
        return this.prisma.userBadge.findMany({
            where: { userId },
            include: { badge: true },
            orderBy: { unlockedAt: 'desc' },
        });
    }

    async getUserLevel(userId: string) {
        return this.prisma.userLevel.findUnique({ where: { userId } });
    }

    private async addXp(userId: string, amount: number, reason: string, sessionId?: string) {
        await this.prisma.userXP.create({
            data: {
                userId,
                amount,
                reason,
                sessionId,
            },
        });

        const level = await this.prisma.userLevel.upsert({
            where: { userId },
            update: {
                totalXp: { increment: amount },
                currentXp: { increment: amount },
            },
            create: {
                userId,
                level: 1,
                currentXp: amount,
                totalXp: amount,
            },
        });

        if (level.currentXp >= 100) {
            const extra = level.currentXp;
            const newLevel = level.level + Math.floor(extra / 100);
            const remaining = extra % 100;
            await this.prisma.userLevel.update({
                where: { userId },
                data: {
                    level: newLevel,
                    currentXp: remaining,
                },
            });
        }
    }

    private async awardBadge(session: UserTestSession, code: string, reason: string) {
        await this.ensureDefaults();
        const badge = await this.prisma.badge.findUnique({ where: { code } });
        if (!badge) return null;

        const or: any[] = [{ sessionId: session.id }];
        if (session.userId) or.push({ userId: session.userId });
        const existing = await this.prisma.userBadge.findFirst({
            where: {
                badgeId: badge.id,
                OR: or,
            },
        });
        if (existing) return existing;

        const created = await this.prisma.userBadge.create({
            data: {
                badgeId: badge.id,
                userId: session.userId ?? undefined,
                sessionId: session.id,
            },
        });

        await this.prisma.badge.update({
            where: { id: badge.id },
            data: { unlockCount: { increment: 1 } },
        });

        if (session.userId) {
            await this.addXp(session.userId, badge.pointsValue, reason, session.id);
        }

        return created;
    }

    async grantPhase1Completed(session: UserTestSession) {
        return this.awardBadge(session, 'PHASE1_COMPLETED', 'Phase 1 terminee');
    }

    async grantPhase2Completed(session: UserTestSession) {
        return this.awardBadge(session, 'PHASE2_COMPLETED', 'Phase 2 terminee');
    }

    async grantTestCompleted(session: UserTestSession) {
        return this.awardBadge(session, 'TEST_COMPLETED', 'Test termine');
    }

    async grantTreasureMap(session: UserTestSession) {
        return this.awardBadge(session, 'TREASURE_MAP', 'Carte au tresor generee');
    }

    health() {
        return { status: 'ok', module: 'badges' };
    }
}
