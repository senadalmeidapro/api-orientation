import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConsistencyLevel, ProfileStrength, RiasecType, SectionType } from '@prisma/client';

const RIASEC_ORDER: RiasecType[] = ['R', 'I', 'A', 'S', 'E', 'C'];

@Injectable()
export class ScoringService {
    constructor(private readonly prisma: PrismaService) {}

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

    async computeScores(sessionId: string) {
        const session = await this.prisma.testSession.findUnique({
            where: { id: sessionId },
            select: { testVersionId: true },
        });
        if (!session) throw new NotFoundException('Session introuvable');

        const phase1Questions = await this.prisma.phase1Question.findMany({
            where: { isActive: true, testVersionId: session.testVersionId },
            select: { riasecTypeId: true },
        });

        const phase2Questions = await this.prisma.phase2Question.findMany({
            where: { isActive: true, testVersionId: session.testVersionId },
            select: { riasecTypeId: true, sectionType: true, maxValue: true },
        });

        const phase1 = await this.prisma.phase1Response.findMany({
            where: { sessionId },
            include: { question: { select: { riasecTypeId: true } } },
        });

        const phase2 = await this.prisma.phase2Response.findMany({
            where: { sessionId },
            include: { question: { select: { riasecTypeId: true, sectionType: true } } },
        });

        const phase1Scores = this.makeEmptyScores();
        for (const r of phase1) {
            const key = r.question.riasecTypeId;
            phase1Scores[key] += r.responseValue;
        }

        const phase2Scores = this.makeEmptyScores();
        const sectionScoresRaw: Record<SectionType, Record<RiasecType, number>> = {
            OCCUPATIONS: this.makeEmptyScores(),
            APTITUDES: this.makeEmptyScores(),
            PERSONALITY: this.makeEmptyScores(),
        };

        for (const r of phase2) {
            const key = r.question.riasecTypeId;
            const section = r.question.sectionType;
            phase2Scores[key] += r.responseValue;
            sectionScoresRaw[section][key] += r.responseValue;
        }

        const maxPhase2 = this.makeEmptyScores();
        const maxBySection: Record<SectionType, Record<RiasecType, number>> = {
            OCCUPATIONS: this.makeEmptyScores(),
            APTITUDES: this.makeEmptyScores(),
            PERSONALITY: this.makeEmptyScores(),
        };
        for (const q of phase2Questions) {
            const maxVal = q.sectionType === SectionType.APTITUDES ? (q.maxValue ?? 3) : 1;
            maxPhase2[q.riasecTypeId] += maxVal;
            maxBySection[q.sectionType][q.riasecTypeId] += maxVal;
        }

        const phase2NormalizedScores = this.normalizeScores(phase2Scores, maxPhase2);
        const sectionScoresNormalized: Record<SectionType, Record<RiasecType, number>> = {
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

        const phase1Code = this.sortCodes(phase1Scores).slice(0, 3).join('');
        const phase2Code = this.sortCodes(phase2Scores).slice(0, 3).join('');

        const overlap = phase1Code.split('').filter((c) => phase2Code.includes(c)).length;

        const consistencyScore = overlap >= 2 ? 3 : overlap === 1 ? 2 : 1;
        const consistencyLevel =
            consistencyScore === 3
                ? ConsistencyLevel.FORTE
                : consistencyScore === 2
                  ? ConsistencyLevel.MOYENNE
                  : ConsistencyLevel.FAIBLE;

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
}
