import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConsistencyLevel, Phase2Type, ProfileStrength, RiasecType } from '@prisma/client';
import { AdaptiveSelectionService } from '../questions/services/adaptive-selection.service';
import { MultiProfileUtil, RiasecScores } from '../../common/utils/multi-profile.util';

const RIASEC_ORDER: RiasecType[] = ['R', 'I', 'A', 'S', 'E', 'C'];

@Injectable()
export class ScoringService {
    private readonly logger = new Logger(ScoringService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly adaptiveService: AdaptiveSelectionService,
    ) {}

    private sortCodes(scores: Record<RiasecType, number>) {
        return [...RIASEC_ORDER].sort((a, b) => {
            const diff = (scores[b] ?? 0) - (scores[a] ?? 0);
            if (diff !== 0) return diff;
            return RIASEC_ORDER.indexOf(a) - RIASEC_ORDER.indexOf(b);
        });
    }

    private makeEmptyScores(): Record<RiasecType, number> {
        return { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    }

    private normalizeScores(raw: Record<RiasecType, number>, max: Record<RiasecType, number>) {
        const normalized = this.makeEmptyScores();
        for (const key of RIASEC_ORDER) {
            const denom = max[key] ?? 0;
            normalized[key] = denom > 0 ? Math.round((raw[key] / denom) * 100) : 0;
        }
        return normalized;
    }

    async computeScores(
        assessmentId: string,
        options?: {
            phase1AssessmentId?: string | null;
            phase2Types?: Phase2Type[];
        },
    ) {
        const assessment = await this.prisma.assessment.findUnique({
            where: { id: assessmentId },
            select: { test_version_id: true },
        });
        if (!assessment) throw new NotFoundException('Assessment introuvable');

        const hasPhase1Override =
            options !== undefined &&
            Object.prototype.hasOwnProperty.call(options, 'phase1AssessmentId');
        const phase1AssessmentId = hasPhase1Override
            ? (options?.phase1AssessmentId ?? null)
            : assessmentId;
        const hasPhase2Filter = options?.phase2Types !== undefined;
        const phase2Types = hasPhase2Filter
            ? (options?.phase2Types ?? [])
            : [Phase2Type.OCCUPATIONS, Phase2Type.APTITUDES, Phase2Type.PERSONALITY];

        const phase1Questions = await this.prisma.phase1Question.findMany({
            where: { is_active: true, test_version_id: assessment.test_version_id },
            select: { riasec_type_id: true },
        });

        const phase2Questions = await this.prisma.phase2Question.findMany({
            where: {
                is_active: true,
                test_version_id: assessment.test_version_id,
                ...(hasPhase2Filter ? { phase2Type: { in: phase2Types } } : {}),
            },
            select: { riasec_type_id: true, phase2_type: true, max_value: true },
        });

        const phase1 = phase1AssessmentId
            ? await this.prisma.phase1Response.findMany({
                  where: { assessment_id: phase1AssessmentId },
                  include: { question: { select: { riasec_type_id: true } } },
              })
            : [];

        const phase2 = await this.prisma.phase2Response.findMany({
            where: {
                assessment_id: assessmentId,
                ...(hasPhase2Filter ? { phase2Type: { in: phase2Types } } : {}),
            },
            include: { question: { select: { riasec_type_id: true, phase2_type: true } } },
        });

        const phase1Scores = this.makeEmptyScores();
        for (const r of phase1) {
            const key = r.question.riasec_type_id;
            phase1Scores[key] += r.response_value;
        }

        const phase2Scores = this.makeEmptyScores();
        const sectionScoresRaw: Record<Phase2Type, Record<RiasecType, number>> = {
            OCCUPATIONS: this.makeEmptyScores(),
            APTITUDES: this.makeEmptyScores(),
            PERSONALITY: this.makeEmptyScores(),
        };

        for (const r of phase2) {
            const key = r.question.riasec_type_id;
            const section = r.question.phase2_type;
            phase2Scores[key] += r.response_value;
            sectionScoresRaw[section][key] += r.response_value;
        }

        const maxPhase2 = this.makeEmptyScores();
        const maxBySection: Record<Phase2Type, Record<RiasecType, number>> = {
            OCCUPATIONS: this.makeEmptyScores(),
            APTITUDES: this.makeEmptyScores(),
            PERSONALITY: this.makeEmptyScores(),
        };
        for (const q of phase2Questions) {
            const maxVal = q.phase2_type === Phase2Type.APTITUDES ? (q.max_value ?? 3) : 1;
            maxPhase2[q.riasec_type_id] += maxVal;
            maxBySection[q.phase2_type][q.riasec_type_id] += maxVal;
        }

        const phase2NormalizedScores = this.normalizeScores(phase2Scores, maxPhase2);
        const sectionScoresNormalized: Record<Phase2Type, Record<RiasecType, number>> = {
            OCCUPATIONS: this.normalizeScores(
                sectionScoresRaw.OCCUPATIONS,
                maxBySection.OCCUPATIONS,
            ),
            APTITUDES: this.normalizeScores(sectionScoresRaw.APTITUDES, maxBySection.APTITUDES),
            PERSONALITY: this.normalizeScores(
                sectionScoresRaw.PERSONALITY,
                maxBySection.PERSONALITY,
            ),
        };

        const hasPhase1 = phase1.length > 0;
        const hasPhase2 = phase2.length > 0;
        const phase1Code = hasPhase1 ? this.sortCodes(phase1Scores).slice(0, 3).join('') : null;
        const phase2Code = hasPhase2 ? this.sortCodes(phase2Scores).slice(0, 3).join('') : null;

        let consistencyScore: number | null = null;
        let consistencyLevel: ConsistencyLevel | null = null;
        if (phase1Code && phase2Code) {
            const overlap = phase1Code.split('').filter((c) => phase2Code.includes(c)).length;
            consistencyScore = overlap >= 2 ? 3 : overlap === 1 ? 2 : 1;
            consistencyLevel =
                consistencyScore === 3
                    ? ConsistencyLevel.FORTE
                    : consistencyScore === 2
                      ? ConsistencyLevel.MOYENNE
                      : ConsistencyLevel.FAIBLE;
        }

        const normalizedValues = this.sortCodes(phase2NormalizedScores).map(
            (k) => phase2NormalizedScores[k],
        );
        const top = normalizedValues[0] ?? 0;
        const rest = normalizedValues.slice(1);
        const differentiationScore =
            rest.length > 0
                ? Math.round(rest.reduce((sum, v) => sum + (top - v), 0) / rest.length)
                : 0;

        let profileStrength: ProfileStrength = ProfileStrength.MOYEN;
        if (top >= 80) profileStrength = ProfileStrength.EXCEPTIONNEL;
        else if (top >= 65) profileStrength = ProfileStrength.TRES_FORT;
        else if (top >= 50) profileStrength = ProfileStrength.FORT;
        else if (top >= 35) profileStrength = ProfileStrength.MOYEN;
        else if (top >= 20) profileStrength = ProfileStrength.FAIBLE;
        else profileStrength = ProfileStrength.TRES_FAIBLE;

        const strengths = this.sortCodes(phase2NormalizedScores).slice(0, 2);

        return {
            phase1Code,
            phase2Code,
            phase1Scores,
            phase2Scores,
            sectionScores: {
                raw: sectionScoresRaw,
                normalized: sectionScoresNormalized,
                maxPossible: maxBySection,
            },
            phase2NormalizedScores,
            consistencyScore,
            consistencyLevel,
            differentiationScore,
            profileStrength,
            strengths,
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
        phase1Scores: RiasecScores;
        phase2Scores: RiasecScores;
        combinedScores: RiasecScores;
    }> {
        const assessment = await this.prisma.assessment.findUnique({
            where: { id: assessmentId },
            include: {
                phase1_responses: {
                    include: {
                        question: {
                            select: {
                                id: true,
                                riasec_type_id: true,
                                profiles: {
                                    select: {
                                        riasec_type: true,
                                        weight: true,
                                    },
                                },
                            },
                        },
                    },
                },
                phase2_responses: {
                    include: {
                        question: {
                            select: {
                                id: true,
                                riasec_type_id: true,
                                profiles: {
                                    select: {
                                        riasec_type: true,
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

        let phase1Scores = MultiProfileUtil.emptyScores();
        let phase2Scores = MultiProfileUtil.emptyScores();

        // Calculer phase1 avec profils multiples
        for (const response of assessment.phase1_responses) {
            if (response.question.profiles.length > 0) {
                // Utiliser les profils multi-RIASEC
                const profiles = response.question.profiles.map((p) => ({
                    riasecType: p.riasec_type,
                    weight: p.weight,
                }));
                phase1Scores = MultiProfileUtil.applyWeightedResponse(
                    phase1Scores,
                    profiles,
                    response.response_value,
                );
            } else {
                // Fallback sur riasec_type_id simple
                phase1Scores[response.question.riasec_type_id] += response.response_value;
            }
        }

        // Calculer phase2 avec profils multiples
        for (const response of assessment.phase2_responses) {
            if (response.question.profiles.length > 0) {
                // Utiliser les profils multi-RIASEC
                const profiles = response.question.profiles.map((p) => ({
                    riasecType: p.riasec_type,
                    weight: p.weight,
                }));
                phase2Scores = MultiProfileUtil.applyWeightedResponse(
                    phase2Scores,
                    profiles,
                    response.response_value,
                );
            } else {
                // Fallback sur riasec_type_id simple
                phase2Scores[response.question.riasec_type_id] += response.response_value;
            }
        }

        const combinedScores = MultiProfileUtil.addScores(phase1Scores, phase2Scores);

        return {
            phase1Scores: MultiProfileUtil.normalizeScores(phase1Scores),
            phase2Scores: MultiProfileUtil.normalizeScores(phase2Scores),
            combinedScores: MultiProfileUtil.normalizeScores(combinedScores),
        };
    }
}
