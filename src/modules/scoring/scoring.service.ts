import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConsistencyLevel, ProfileStrength, RiasecType, TestType } from '@prisma/client';
import { AdaptiveSelectionService } from '../questions/services/adaptive-selection.service';
import { MultiProfileUtil, RiasecScores } from '@common/utils/multi-profile.util';

const riasecOrder: RiasecType[] = ['R', 'I', 'A', 'S', 'E', 'C'];
const categoryOrder = [
  TestType.OCCUPATIONS,
  TestType.APTITUDES,
  TestType.PERSONALITY,
] as const;
type ScoredCategory =
  | 'GENERALE'
  | 'OCCUPATIONS'
  | 'APTITUDES'
  | 'PERSONALITY';

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly adaptiveService: AdaptiveSelectionService,
  ) {}

  private sortCodes(scores: Record<RiasecType, number>) {
    return [...riasecOrder].sort((a, b) => {
      const diff = (scores[b] ?? 0) - (scores[a] ?? 0);
      if (diff !== 0) return diff;
      return riasecOrder.indexOf(a) - riasecOrder.indexOf(b);
    });
  }

  private makeEmptyScores(): Record<RiasecType, number> {
    return { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  }

  private normalizeScores(raw: Record<RiasecType, number>, max: Record<RiasecType, number>) {
    const normalized = this.makeEmptyScores();
    for (const key of riasecOrder) {
      const denom = max[key] ?? 0;
      normalized[key] = denom > 0 ? Math.round((raw[key] / denom) * 100) : 0;
    }
    return normalized;
  }

  async computeScores(
    assessmentId: string,
    options?: {
      generalAssessmentId?: string | null;
      categories?: TestType[];
    },
  ) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: { testVersionId: true },
    });
    if (!assessment) throw new NotFoundException('Assessment introuvable');

    const hasGeneralOverride =
      options !== undefined && Object.prototype.hasOwnProperty.call(options, 'generalAssessmentId');
    const generalAssessmentId = hasGeneralOverride
      ? (options?.generalAssessmentId ?? null)
      : assessmentId;
    const categories = options?.categories ?? [...categoryOrder];

    const questions = await this.prisma.question.findMany({
      where: {
        isActive: true,
        testVersionId: assessment.testVersionId,
        category: { in: categories },
      },
      select: { riasecTypeId: true, category: true, maxValue: true },
    });

    const general = generalAssessmentId
      ? await this.prisma.response.findMany({
          where: { assessmentId: generalAssessmentId, question: { category: TestType.GENERALE } },
          include: { question: { select: { riasecTypeId: true } } },
        })
      : [];

    const specific = await this.prisma.response.findMany({
      where: {
        assessmentId,
        question: { category: { in: categories } },
      },
      include: { question: { select: { riasecTypeId: true, category: true } } },
    });

    const generalScores = this.makeEmptyScores();
    for (const r of general) {
      const key = r.question.riasecTypeId;
      generalScores[key] += r.responseValue;
    }

    const specificScores = this.makeEmptyScores();
    const sectionScoresRaw = this.makeCategoryScores();

    for (const r of specific) {
      const key = r.question.riasecTypeId;
      const section = r.question.category as ScoredCategory;
      specificScores[key] += r.responseValue;
      const currentSectionScores = sectionScoresRaw[section];
      if (currentSectionScores) {
        currentSectionScores[key] += r.responseValue;
      }
    }

    const maxSpecific = this.makeEmptyScores();
    const maxBySection = this.makeCategoryScores();
    for (const q of questions) {
      const section = q.category as ScoredCategory;
      const maxVal = q.category === TestType.APTITUDES ? (q.maxValue ?? 3) : 1;
      maxSpecific[q.riasecTypeId] += maxVal;
      const currentSectionMax = maxBySection[section];
      if (currentSectionMax) {
        currentSectionMax[q.riasecTypeId] += maxVal;
      }
    }

    const specificNormalizedScores = this.normalizeScores(specificScores, maxSpecific);
    const sectionScoresNormalized = this.makeCategoryScores();
    for (const category of [TestType.GENERALE, ...categoryOrder]) {
      sectionScoresNormalized[category] = this.normalizeScores(
        sectionScoresRaw[category] ?? this.makeEmptyScores(),
        maxBySection[category] ?? this.makeEmptyScores(),
      );
    }

    const hasGeneral = general.length > 0;
    const hasSpecific = specific.length > 0;
    const generalCode = hasGeneral ? this.sortCodes(generalScores).slice(0, 3).join('') : null;
    const specificCode = hasSpecific ? this.sortCodes(specificScores).slice(0, 3).join('') : null;

    let consistencyScore: number | null = null;
    let consistencyLevel: ConsistencyLevel | null = null;
    if (generalCode && specificCode) {
      const overlap = generalCode.split('').filter((c) => specificCode.includes(c)).length;
      consistencyScore = overlap >= 2 ? 3 : overlap === 1 ? 2 : 1;
      consistencyLevel =
        consistencyScore === 3
          ? ConsistencyLevel.FORTE
          : consistencyScore === 2
            ? ConsistencyLevel.MOYENNE
            : ConsistencyLevel.FAIBLE;
    }

    const normalizedValues = this.sortCodes(specificNormalizedScores).map(
      (k) => specificNormalizedScores[k],
    );
    const top = normalizedValues[0] ?? 0;
    const rest = normalizedValues.slice(1);
    const differentiationScore =
      rest.length > 0 ? Math.round(rest.reduce((sum, v) => sum + (top - v), 0) / rest.length) : 0;

    let profileStrength: ProfileStrength = ProfileStrength.MOYEN;
    if (top >= 80) profileStrength = ProfileStrength.EXCEPTIONNEL;
    else if (top >= 65) profileStrength = ProfileStrength.TRES_FORT;
    else if (top >= 50) profileStrength = ProfileStrength.FORT;
    else if (top >= 35) profileStrength = ProfileStrength.MOYEN;
    else if (top >= 20) profileStrength = ProfileStrength.FAIBLE;
    else profileStrength = ProfileStrength.TRES_FAIBLE;

    const strengths = this.sortCodes(specificNormalizedScores).slice(0, 2);

    return {
      generalCode,
      specificCode,
      generalScores,
      specificScores,
      sectionScores: {
        raw: sectionScoresRaw,
        normalized: sectionScoresNormalized,
        maxPossible: maxBySection,
      },
      specificNormalizedScores,
      consistencyScore,
      consistencyLevel,
      differentiationScore,
      profileStrength,
      strengths,
    };
  }

  private makeCategoryScores(): Record<ScoredCategory, Record<RiasecType, number>> {
    return {
      GENERALE: this.makeEmptyScores(),
      OCCUPATIONS: this.makeEmptyScores(),
      APTITUDES: this.makeEmptyScores(),
      PERSONALITY: this.makeEmptyScores(),
    };
  }

  /**
   * Nouvelle méthode : Calculer un score intermédiaire basé sur les profils multi-RIASEC
   * Utilisé après chaque lot pour mettre à jour le profil adaptatif
   */
  async calculateIntermediateScore(
    assessmentId: string,
    batchIndex: number,
  ): Promise<RiasecScores> {
    return await this.adaptiveService
      .calculateIntermediateProfile(assessmentId, batchIndex)
      .then((profile) => profile.profileData);
  }

  /**
   * Calculer les scores en tenant compte des profils multi-RIASEC
   * Si des QuestionProfile existent, ils sont utilisés à la place des riasec_type_id simples
   */
  async computeMultiProfileScores(assessmentId: string): Promise<{
    generalScores: RiasecScores;
    specificScores: RiasecScores;
    combinedScores: RiasecScores;
  }> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        responses: {
          include: {
            question: {
              select: {
                id: true,
                riasecTypeId: true,
                category: true,
                profiles: {
                  select: {
                    riasecType: true,
                    weight: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    let generalScores = MultiProfileUtil.emptyScores();
    let specificScores = MultiProfileUtil.emptyScores();

    for (const response of assessment.responses) {
      const targetScores =
        response.question.category === TestType.GENERALE ? generalScores : specificScores;
      if (response.question.profiles.length > 0) {
        const profiles = response.question.profiles.map((p) => ({
          riasecType: p.riasecType,
          weight: p.weight,
        }));
        const updated = MultiProfileUtil.applyWeightedResponse(
          targetScores,
          profiles,
          response.responseValue,
        );
        if (response.question.category === TestType.GENERALE) generalScores = updated;
        else specificScores = updated;
      } else {
        targetScores[response.question.riasecTypeId] += response.responseValue;
      }
    }

    const combinedScores = MultiProfileUtil.addScores(generalScores, specificScores);

    return {
      generalScores: MultiProfileUtil.normalizeScores(generalScores),
      specificScores: MultiProfileUtil.normalizeScores(specificScores),
      combinedScores: MultiProfileUtil.normalizeScores(combinedScores),
    };
  }
}
