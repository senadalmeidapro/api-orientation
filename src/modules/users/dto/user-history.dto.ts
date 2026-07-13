import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BadgeRarity, TestStatus, TestType } from '@prisma/client';

// ─────────────────────────────────────────────────────────────────────────────
// Sous-DTOs réutilisables
// ─────────────────────────────────────────────────────────────────────────────

export class GamificationSummaryDto {
  @ApiProperty({ description: 'Points XP totaux cumulés', example: 120 })
  totalXp!: number;

  @ApiProperty({ description: 'Niveau actuel', example: 2 })
  level!: number;
}

export class BadgeSummaryDto {
  @ApiProperty({ description: 'Identifiant unique du badge', example: 1 })
  id!: number;

  @ApiProperty({ description: 'Code unique du badge', example: 'TEST_COMPLETED' })
  code!: string;

  @ApiProperty({ description: 'Nom du badge', example: 'Orientation' })
  name!: string;

  @ApiProperty({ description: 'Description du badge' })
  description!: string;

  @ApiProperty({ description: 'Emoji associé au badge', example: 'flag' })
  emoji!: string;

  @ApiProperty({ enum: BadgeRarity, description: 'Rareté du badge' })
  rarity!: BadgeRarity;

  @ApiProperty({ description: 'Points XP accordés par ce badge', example: 50 })
  pointsValue!: number;

  @ApiProperty({ description: 'Date de déverrouillage' })
  unlockedAt!: Date;
}

export class AssessmentSummaryDto {
  @ApiProperty({ description: 'Identifiant du test', example: 'clx-assessment-id' })
  id!: string;

  @ApiProperty({ enum: TestType, description: 'Type du test' })
  type!: TestType;

  @ApiProperty({ enum: TestStatus, description: 'Statut du test' })
  status!: TestStatus;

  @ApiProperty({ description: 'Pourcentage de complétion (0–100)', example: 100 })
  completionPercentage!: number;

  @ApiPropertyOptional({ description: 'Code RIASEC issu de la générales', example: 'RIA' })
  generalCode?: string | null;

  @ApiPropertyOptional({ description: 'Code RIASEC issu de la catégorie', example: 'RIS' })
  specificCode?: string | null;

  @ApiPropertyOptional({ description: 'Niveau de cohérence du profil', example: 'HIGH' })
  consistencyLevel?: string | null;

  @ApiPropertyOptional({ description: 'Indique si un résultat calculé existe' })
  hasResult!: boolean;

  @ApiPropertyOptional({ description: 'Indique si une carte au trésor a été générée' })
  hasTreasureMap!: boolean;

  @ApiProperty({ description: 'Date de démarrage du test' })
  startedAt!: Date;

  @ApiPropertyOptional({ description: 'Date de complétion du test' })
  completedAt?: Date | null;
}

export class SessionSummaryDto {
  @ApiProperty({ description: 'Identifiant de la session', example: 'clx-session-id' })
  id!: string;

  @ApiProperty({
    description: 'Token de session (pour les appels API ultérieurs)',
    example: '4ce2f33a-8dfe-4b20-a5f2-9d3d8b6d2dcd',
  })
  sessionToken!: string;

  @ApiProperty({
    description: 'Token de partage public du profil',
    example: '3c96a7a8-5ab8-4f2b-a62e-a6f44c37250d',
  })
  shareToken!: string;

  @ApiProperty({ description: 'Date de création de la session' })
  createdAt!: Date;

  @ApiProperty({
    description: 'Liste des tests réalisés dans cette session',
    type: [AssessmentSummaryDto],
  })
  assessments!: AssessmentSummaryDto[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Endpoint 1 : GET /users/me/history
// Vue synthétique : profil + gamification + toutes sessions + tests résumés
// ─────────────────────────────────────────────────────────────────────────────

export class UserHistoryDto {
  @ApiProperty({ description: "Identifiant de l'utilisateur" })
  id!: string;

  @ApiPropertyOptional({ description: "Email de l'utilisateur" })
  email?: string | null;

  @ApiPropertyOptional({ description: 'Prénom' })
  firstName?: string | null;

  @ApiPropertyOptional({ description: 'Nom de famille' })
  lastName?: string | null;

  @ApiPropertyOptional({ description: "Nom d'affichage" })
  displayName?: string | null;

  @ApiPropertyOptional({ description: "Biographie / profil JSON de l'utilisateur" })
  bio?: string | null;

  @ApiProperty({ description: "Date d'inscription" })
  createdAt!: Date;

  @ApiProperty({ description: 'Synthèse gamification (XP et niveau)' })
  gamification!: GamificationSummaryDto;

  @ApiProperty({ description: 'Badges déverrouillés', type: [BadgeSummaryDto] })
  badges!: BadgeSummaryDto[];

  @ApiProperty({
    description: 'Historique des sessions et de leurs tests associés',
    type: [SessionSummaryDto],
  })
  sessions!: SessionSummaryDto[];

  @ApiProperty({ description: 'Nombre total de tests commencés', example: 3 })
  totalAssessments!: number;

  @ApiProperty({ description: 'Nombre total de tests terminés', example: 2 })
  completedAssessments!: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Endpoint 2 : GET /users/me/assessments/:assessmentId
// Détail complet d'un test : résultats, scores détaillés, comportement
// ─────────────────────────────────────────────────────────────────────────────

export class RiasecScoresDto {
  @ApiProperty({ example: 80 }) R!: number;
  @ApiProperty({ example: 60 }) I!: number;
  @ApiProperty({ example: 45 }) A!: number;
  @ApiProperty({ example: 70 }) S!: number;
  @ApiProperty({ example: 55 }) E!: number;
  @ApiProperty({ example: 30 }) C!: number;
}

export class BehaviorMetricsDto {
  @ApiProperty({ description: 'Nombre total de réponses enregistrées', example: 30 })
  responseCount!: number;

  @ApiPropertyOptional({ description: 'Temps moyen de réponse en millisecondes', example: 4200 })
  avgResponseTimeMs?: number | null;

  @ApiPropertyOptional({ description: 'Variance du temps de réponse en ms', example: 1500 })
  responseVarianceMs?: number | null;

  @ApiPropertyOptional({
    description: 'Profil comportemental dominant (Confident, Deliberate, Uncertain…)',
    example: 'Deliberate',
  })
  dominantPattern?: string | null;
}

export class AssessmentResultDetailDto {
  @ApiProperty({ description: 'Identifiant du résultat' })
  id!: string;

  @ApiPropertyOptional({ description: 'Code RIASEC générales (3 lettres)', example: 'RIA' })
  generalCode?: string | null;

  @ApiPropertyOptional({ description: 'Code RIASEC catégorie (3 lettres)', example: 'RIS' })
  specificCode?: string | null;

  @ApiPropertyOptional({
    description: 'Points forts identifiés',
    type: [String],
    example: ['Curiosité intellectuelle', 'Sens artistique'],
  })
  strengths?: string[];

  @ApiPropertyOptional({ description: 'Niveau de cohérence du profil', example: 'HIGH' })
  consistencyLevel?: string | null;

  @ApiPropertyOptional({ description: 'Score de cohérence (0–100)', example: 78 })
  consistencyScore?: number | null;

  @ApiPropertyOptional({ description: 'Force du profil (LOW / MEDIUM / HIGH)', example: 'HIGH' })
  profileStrength?: string | null;

  @ApiPropertyOptional({
    description: 'Score de différenciation (clarté du profil, 0–100)',
    example: 62,
  })
  differentiationScore?: number | null;

  @ApiPropertyOptional({ description: 'Scores bruts RIASEC générales' })
  generalScores?: Record<string, number> | null;

  @ApiPropertyOptional({ description: 'Scores bruts RIASEC catégorie' })
  specificScores?: Record<string, number> | null;

  @ApiPropertyOptional({
    description: 'Scores détaillés par section (Occupations / Aptitudes / Personality)',
  })
  sectionScores?: Record<string, unknown> | null;

  @ApiPropertyOptional({ description: "Classement subjectif fourni par l'utilisateur" })
  subjectiveRanking?: unknown;

  @ApiProperty({ description: 'Date de calcul du résultat' })
  createdAt!: Date;
}

export class TreasureMapSummaryDto {
  @ApiProperty({ description: 'Identifiant de la carte au trésor' })
  id!: string;

  @ApiProperty({ description: 'Token de partage public', example: 'abc-share-token-uuid' })
  shareToken!: string;

  @ApiPropertyOptional({ description: 'URL du PDF généré' })
  pdfUrl?: string | null;

  @ApiProperty({ description: 'Nombre de vues', example: 4 })
  viewCount!: number;

  @ApiProperty({ description: 'Nombre de téléchargements', example: 1 })
  downloadCount!: number;

  @ApiPropertyOptional({ description: 'Date de la dernière vue' })
  lastViewedAt?: Date | null;

  @ApiProperty({ description: 'Date de génération de la carte' })
  createdAt!: Date;
}

export class AssessmentDetailDto {
  @ApiProperty({ description: 'Identifiant du test' })
  id!: string;

  @ApiProperty({ enum: TestType })
  type!: TestType;

  @ApiProperty({ enum: TestStatus })
  status!: TestStatus;

  @ApiProperty({ description: 'Pourcentage de complétion', example: 100 })
  completionPercentage!: number;

  @ApiProperty({ description: 'Date de démarrage' })
  startedAt!: Date;

  @ApiPropertyOptional({ description: 'Date de complétion' })
  completedAt?: Date | null;

  @ApiPropertyOptional({ description: 'Résultat RIASEC complet (null si test non terminé)' })
  result?: AssessmentResultDetailDto | null;

  @ApiPropertyOptional({ description: 'Métriques comportementales relevées pendant le test' })
  behaviorMetrics?: BehaviorMetricsDto | null;

  @ApiPropertyOptional({ description: 'Carte au trésor associée (null si non générée)' })
  treasureMap?: TreasureMapSummaryDto | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Endpoint 3 : GET /users/me/assessments/:assessmentId/recommendations
// Recommandations complètes : métiers + formations + bourses associées
export class CareerDetailDto {
  @ApiProperty({ description: 'Identifiant du métier', example: 42 })
  id!: number;

  @ApiProperty({ description: 'Nom du métier', example: 'Ingénieur Informatique' })
  name!: string;

  @ApiPropertyOptional({ description: 'Résumé court' })
  summary?: string | null;

  @ApiPropertyOptional({ description: 'Description complète' })
  description?: string | null;

  @ApiPropertyOptional({ description: 'Catégorie professionnelle', example: 'Technologies' })
  category?: string | null;

  @ApiProperty({
    description: 'Codes RIASEC associés au métier',
    type: [String],
    example: ['R', 'I', 'A'],
  })
  riasecCodes!: string[];

  @ApiPropertyOptional({ description: 'Indice de demande locale (1–5)', example: 4 })
  localDemand?: number | null;

  @ApiPropertyOptional({ description: 'Niveau de formation recommandé', example: 'Master' })
  formationLevel?: string | null;

  @ApiPropertyOptional({ description: 'Salaire minimum estimé', example: 300000 })
  salaryRangeMin?: number | null;

  @ApiPropertyOptional({ description: 'Salaire maximum estimé', example: 700000 })
  salaryRangeMax?: number | null;

  @ApiPropertyOptional({ description: "URL de l'image du métier" })
  imageUrl?: string | null;

  @ApiPropertyOptional({ description: "URL d'une vidéo de présentation" })
  videoUrl?: string | null;

  @ApiPropertyOptional({ description: 'Tags associés', type: [String] })
  tags?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────

export class CareerRecommendationItemDto {
  @ApiProperty({ description: 'Identifiant de la recommandation' })
  id!: string;

  @ApiProperty({ description: 'Position dans le classement', example: 1 })
  rankPosition!: number;

  @ApiProperty({ description: 'Score de compatibilité (0–100)', example: 87 })
  matchScore!: number;

  @ApiProperty({ description: 'Indique si la recommandation a déjà été vue' })
  viewed!: boolean;

  @ApiProperty({ description: 'Sauvegardé pour plus tard' })
  savedForLater!: boolean;

  @ApiPropertyOptional({ description: 'Date de première consultation' })
  viewedAt?: Date | null;

  @ApiProperty({ description: 'Détails du métier' })
  career!: CareerDetailDto;
}

export class ScholarshipItemDto {
  @ApiProperty({ description: 'Identifiant de la bourse', example: 5 })
  id!: number;

  @ApiPropertyOptional({ description: 'Code de la bourse', example: 'BOURSE-EXCEL-2026' })
  code?: string | null;

  @ApiProperty({ description: 'Intitulé de la bourse', example: "Bourse d'Excellence ANEF" })
  title!: string;

  @ApiProperty({ description: 'Organisme fournisseur', example: 'ANEF Bénin' })
  provider!: string;

  @ApiPropertyOptional({ description: 'Montant indicatif', example: '500 000 FCFA / an' })
  amountLabel?: string | null;

  @ApiPropertyOptional({ description: 'URL de candidature' })
  applicationUrl?: string | null;

  @ApiPropertyOptional({ description: 'Date de clôture des candidatures' })
  applicationCloseAt?: Date | null;

  @ApiPropertyOptional({ description: 'Type de financement', example: 'Bourse complète' })
  fundingType?: string | null;

  @ApiProperty({ description: 'Raisons de la correspondance avec le profil', type: [String] })
  matchReason!: string[];
}

export class FormationRecommendationItemDto {
  @ApiProperty({ description: 'Détails de la formation' })
  formation!: {
    id: number;
    title: string;
    degree: string;
    duration: string;
    field?: string | null;
    costMin?: number | null;
    costMax?: number | null;
  };

  @ApiProperty({ description: 'Université proposant cette formation' })
  university!: {
    id: number;
    name: string;
    city?: string | null;
    address?: string | null;
    website: string;
    latitude?: number | null;
    longitude?: number | null;
  };

  @ApiProperty({ description: 'Score de pertinence de la formation (0–100)', example: 82 })
  score!: number;

  @ApiProperty({
    description: 'Bourses disponibles pour cette formation',
    type: [ScholarshipItemDto],
  })
  scholarships!: ScholarshipItemDto[];
}

export class AssessmentRecommendationsDto {
  @ApiProperty({ description: 'Identifiant du test concerné' })
  assessmentId!: string;

  @ApiPropertyOptional({
    description: 'Code RIASEC utilisé pour les recommandations',
    example: 'RIA',
  })
  riasecCode?: string | null;

  @ApiProperty({
    description: 'Recommandations de métiers triées par score',
    type: [CareerRecommendationItemDto],
  })
  careers!: CareerRecommendationItemDto[];

  @ApiProperty({
    description: 'Recommandations de formations universitaires',
    type: [FormationRecommendationItemDto],
  })
  formations!: FormationRecommendationItemDto[];

  @ApiProperty({ description: 'Nombre total de métiers recommandés', example: 6 })
  totalCareers!: number;

  @ApiProperty({ description: 'Nombre total de formations recommandées', example: 8 })
  totalFormations!: number;
}
