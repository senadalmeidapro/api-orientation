import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {BadgeRarity, Session, TestType} from '@prisma/client';

@Injectable()
export class BadgesService {
  private readonly logger = new Logger(BadgesService.name);

  constructor(private readonly prisma: PrismaService) {}

  private defaultBadges = [
    {
      code: 'GENERAL_COMPLETED',
      name: 'Explorateur',
      description: 'Tu as termine la générales du test.',
      emoji: 'compass',
      rarity: BadgeRarity.COMMON,
      pointsValue: 20,
      unlockCondition: { type: 'category_completion', category: "GENERALE" },
    },
    {
      code: 'SPECIFIC_COMPLETED',
      name: 'Analyste',
      description: 'Tu as termine la catégorie du test.',
      emoji: 'brain',
      rarity: BadgeRarity.RARE,
      pointsValue: 30,
      unlockCondition: { type: 'category_completion', category: "SPECIFIC" },
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

  private async addXp(sessionId: string, amount: number, reason: string) {
    await this.prisma.xPHistory.create({
      data: {
        sessionId: sessionId,
        amount,
        reason,
      },
    });

    const session = await this.prisma.session.update({
      where: { id: sessionId },
      data: { totalXp: { increment: amount } },
      select: { totalXp: true, level: true },
    });

    const nextLevel = Math.floor(session.totalXp / 100) + 1;
    if (nextLevel !== session.level) {
      await this.prisma.session.update({
        where: { id: sessionId },
        data: { level: nextLevel },
      });
    }
  }

  private async awardBadge(session: Pick<Session, 'id'>, code: string, reason: string) {
    await this.ensureDefaults();
    const badge = await this.prisma.badge.findUnique({ where: { code } });
    if (!badge) return null;

    const existing = await this.prisma.sessionBadge.findFirst({
      where: { badgeId: badge.id, sessionId: session.id },
    });
    if (existing) return existing;

    const created = await this.prisma.sessionBadge.create({
      data: {
        badgeId: badge.id,
        sessionId: session.id,
      },
    });

    await this.prisma.badge.update({
      where: { id: badge.id },
      data: { unlockCount: { increment: 1 } },
    });

    await this.addXp(session.id, badge.pointsValue, reason);

    return created;
  }

  async grantGeneralCompleted(session: Pick<Session, 'id'>) {
    return this.awardBadge(session, 'GENERAL_COMPLETED', 'générales terminee');
  }

  async grantSpecificCompleted(session: Pick<Session, 'id'>, type: TestType) {
    return this.awardBadge(session, type, 'catégorie terminee');
  }

  async grantTestCompleted(session: Pick<Session, 'id'>) {
    return this.awardBadge(session, 'TEST_COMPLETED', 'Test termine');
  }

  async grantTreasureMap(session: Pick<Session, 'id'>) {
    return this.awardBadge(session, 'TREASURE_MAP', 'Carte au tresor generee');
  }

  health() {
    return { status: 'ok', module: 'badges' };
  }
}
