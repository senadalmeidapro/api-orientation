import { BadgeRarity, type Prisma } from '@prisma/client';
import type { PrismaService } from '../../../prisma/prisma.service';

type BadgeSeed = {
  code: string;
  name: string;
  description: string;
  emoji: string;
  rarity: BadgeRarity;
  pointsValue: number;
  unlockCondition: Prisma.InputJsonValue;
};

const enhancedBadges: BadgeSeed[] = [
  {
    code: 'DEBUTANT',
    name: 'Débutant',
    description: 'Tu as commencé ton parcours de découverte !',
    emoji: '🌱',
    rarity: BadgeRarity.COMMON,
    pointsValue: 5,
    unlockCondition: { type: 'first_question_answered' },
  },
  {
    code: 'EXPLORATEUR',
    name: 'Explorateur',
    description: 'Tu as exploré la Phase 1 en profondeur !',
    emoji: '🧭',
    rarity: BadgeRarity.COMMON,
    pointsValue: 15,
    unlockCondition: { type: 'phase_completion', phase: 1 },
  },
  {
    code: 'ANALYSTE',
    name: 'Analyste',
    description: 'Tu as complété la Phase 2 avec attention !',
    emoji: '🔍',
    rarity: BadgeRarity.RARE,
    pointsValue: 40,
    unlockCondition: { type: 'phase_completion', phase: 2 },
  },
  {
    code: 'MAITRE_RIASEC',
    name: 'Maître RIASEC',
    description: 'Tu as exploré les 6 dimensions RIASEC !',
    emoji: '🎓',
    rarity: BadgeRarity.RARE,
    pointsValue: 60,
    unlockCondition: { type: 'all_riasec_explored', minResponses: 20 },
  },
  {
    code: 'BATISSEUR',
    name: 'Bâtisseur',
    description: 'Tu es un Réaliste ! Tu construis, répares et travailles avec tes mains.',
    emoji: '🏗️',
    rarity: BadgeRarity.EPIC,
    pointsValue: 100,
    unlockCondition: { type: 'dominant_riasec_type', riasecType: 'R', minPercentage: 25 },
  },
  {
    code: 'CHERCHEUR',
    name: 'Chercheur',
    description: 'Tu es un Investigateur ! Tu aimes analyser, comprendre et découvrir.',
    emoji: '🔬',
    rarity: BadgeRarity.EPIC,
    pointsValue: 100,
    unlockCondition: { type: 'dominant_riasec_type', riasecType: 'I', minPercentage: 25 },
  },
  {
    code: 'ARTISTE',
    name: 'Artiste',
    description: 'Tu es un Artiste ! Tu exprimes ta créativité et ton originalité.',
    emoji: '🎨',
    rarity: BadgeRarity.EPIC,
    pointsValue: 100,
    unlockCondition: { type: 'dominant_riasec_type', riasecType: 'A', minPercentage: 25 },
  },
  {
    code: 'HUMANISTE',
    name: 'Humaniste',
    description: 'Tu es un Social ! Tu aimes aider, enseigner et soutenir les autres.',
    emoji: '❤️',
    rarity: BadgeRarity.EPIC,
    pointsValue: 100,
    unlockCondition: { type: 'dominant_riasec_type', riasecType: 'S', minPercentage: 25 },
  },
  {
    code: 'LEADER',
    name: 'Leader',
    description: 'Tu es un Entrepreneur ! Tu diriges, influences et crées des opportunités.',
    emoji: '👑',
    rarity: BadgeRarity.EPIC,
    pointsValue: 100,
    unlockCondition: { type: 'dominant_riasec_type', riasecType: 'E', minPercentage: 25 },
  },
  {
    code: 'ORGANISATEUR',
    name: 'Organisateur',
    description: "Tu es un Conventionnel ! Tu organises, planifies et assures l'ordre.",
    emoji: '📋',
    rarity: BadgeRarity.EPIC,
    pointsValue: 100,
    unlockCondition: { type: 'dominant_riasec_type', riasecType: 'C', minPercentage: 25 },
  },
  {
    code: 'CONSISTANT',
    name: 'Consistant',
    description: 'Ton profil est très cohérent ! Tes réponses montrent une grande clarté.',
    emoji: '🎯',
    rarity: BadgeRarity.RARE,
    pointsValue: 70,
    unlockCondition: { type: 'consistency_score', minScore: 0.85 },
  },
  {
    code: 'ECLECTIQUE',
    name: 'Éclectique',
    description: "Ton profil est diversifié ! Tu as de l'intérêt pour plusieurs domaines.",
    emoji: '🌈',
    rarity: BadgeRarity.RARE,
    pointsValue: 60,
    unlockCondition: { type: 'consistency_score', maxScore: 0.5 },
  },
  {
    code: 'UNIQUE',
    name: 'Unique',
    description: 'Ton profil est original et sort des sentiers battus ! Bravo pour ta singularité.',
    emoji: '🦄',
    rarity: BadgeRarity.LEGENDARY,
    pointsValue: 120,
    unlockCondition: { type: 'differentiation_score', minScore: 0.8 },
  },
  {
    code: 'EQUILIVRE',
    name: 'Équilibré',
    description: 'Tu as un profil bien équilibré entre tous les types RIASEC !',
    emoji: '⚖️',
    rarity: BadgeRarity.RARE,
    pointsValue: 65,
    unlockCondition: { type: 'profile_balance', maxDeviation: 15 },
  },
];

export async function seedEnhancedBadges(prisma: PrismaService) {
  console.log('🏆 Seeding enhanced badge data...');

  for (const badge of enhancedBadges) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: {
        name: badge.name,
        description: badge.description,
        emoji: badge.emoji,
        rarity: badge.rarity,
        pointsValue: badge.pointsValue,
        unlockCondition: badge.unlockCondition,
      },
      create: {
        code: badge.code,
        name: badge.name,
        description: badge.description,
        emoji: badge.emoji,
        rarity: badge.rarity,
        pointsValue: badge.pointsValue,
        unlockCondition: badge.unlockCondition,
      },
    });
  }

  console.log(`✓ ${enhancedBadges.length} badges seeded`);
}
