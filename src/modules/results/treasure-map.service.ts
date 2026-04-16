import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ResultsService } from './results.service';
import { AssessmentStatus, RiasecType, Prisma } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { StorageService } from '../media/storage.service';
import { BadgesService } from '../badges/badges.service';
import { randomUUID } from 'crypto';

@Injectable()
export class TreasureMapService {
    private readonly logger = new Logger(TreasureMapService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly resultsService: ResultsService,
        private readonly storage: StorageService,
        private readonly badges: BadgesService,
    ) {}

    private buildWeights(phase2Code: string) {
        const letters = phase2Code.split('') as RiasecType[];
        const weights: Record<string, number> = {};
        if (letters[0]) weights[letters[0]] = 50;
        if (letters[1]) weights[letters[1]] = 30;
        if (letters[2]) weights[letters[2]] = 20;
        return weights;
    }

    private async computeRecommendations(resultId: string, baseCode: string, limit = 6) {
        if (!baseCode) return [];
        const weights = this.buildWeights(baseCode);
        const careers = await this.prisma.career.findMany({
            where: { is_active: true },
        });

        const scored = careers
            .map((career) => {
                const codes = career.riasec_codes;
                let sum = 0;
                let matched = 0;
                for (const code of codes) {
                    const w = weights[code] ?? 0;
                    if (w > 0) {
                        sum += w;
                        matched += 1;
                    }
                }
                if (matched === 0) return { career, score: 0 };
                const baseScore = Math.round(sum / Math.max(codes.length, 1));
                const demandBoost = career.local_demand ? career.local_demand * 2 : 0;
                return { career, score: baseScore + demandBoost };
            })
            .filter((c) => c.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        if (scored.length === 0) return [];

        await this.prisma.$transaction(
            scored.map((item, index) =>
                this.prisma.assessmentCareerRecommendation.upsert({
                    where: {
                        result_id_career_id: {
                            result_id: resultId,
                            career_id: item.career.id,
                        },
                    },
                    update: {
                        match_score: Math.min(100, item.score),
                        rank_position: index + 1,
                    },
                    create: {
                        result_id: resultId,
                        career_id: item.career.id,
                        match_score: Math.min(100, item.score),
                        rank_position: index + 1,
                    },
                }),
            ),
        );

        return scored.map((item, index) => ({
            rankPosition: index + 1,
            matchScore: Math.min(100, item.score),
            career: item.career,
        }));
    }

    private async generatePdfBuffer(mapData: any) {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));

        doc.fontSize(20).text('Carte au Tresor RIASEC', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Code Phase 1: ${mapData.phase1Code}`);
        doc.text(`Code Phase 2: ${mapData.phase2Code}`);
        doc.text(`Profil de force: ${mapData.profileStrength}`);
        doc.text(`Cohérence: ${mapData.consistencyLevel}`);
        doc.moveDown();

        doc.fontSize(14).text('Recommandations', { underline: true });
        for (const rec of mapData.recommendations) {
            doc.fontSize(11).text(`- ${rec.career.name} (${rec.matchScore}%)`);
        }

        doc.end();

        await new Promise<void>((resolve, reject) => {
            doc.on('end', () => resolve());
            doc.on('error', reject);
        });

        return Buffer.concat(chunks);
    }

    async generate(sessionToken: string, assessmentId?: string, generatePdf = false) {
        const session = await this.prisma.session.findUnique({
            where: { session_token: sessionToken },
            select: { id: true },
        });
        if (!session) throw new NotFoundException('Session introuvable');

        const assessment = assessmentId
            ? await this.prisma.assessment.findFirst({
                  where: { id: assessmentId, session_id: session.id },
              })
            : await this.prisma.assessment.findFirst({
                  where: { session_id: session.id, status: AssessmentStatus.COMPLETED },
                  orderBy: { completed_at: 'desc' },
              });
        if (!assessment) {
            throw new NotFoundException('Aucun test disponible pour cette session');
        }

        let result = await this.prisma.assessmentResult.findUnique({
            where: { assessment_id: assessment.id },
        });
        if (!result) {
            if (assessment.status !== AssessmentStatus.COMPLETED) {
                throw new NotFoundException('Resultat indisponible, test non termine');
            }
            result = await this.resultsService.compute({
                sessionToken,
                assessmentId: assessment.id,
            });
        }

        const existingRecs = await this.prisma.assessmentCareerRecommendation.findMany({
            where: { result_id: result.id },
            include: { career: true },
            orderBy: { rank_position: 'asc' },
            take: 6,
        });

        const recs = existingRecs.length
            ? existingRecs.map((r) => ({
                  rankPosition: r.rank_position,
                  matchScore: r.match_score,
                  career: r.career,
              }))
            : await this.computeRecommendations(
                  result.id,
                  result.phase2_code ?? result.phase1_code ?? '',
                  6,
              );

        const mapData = {
            generatedAt: new Date().toISOString(),
            phase1_code: result.phase1_code,
            phase2_code: result.phase2_code,
            phase1_scores: result.phase1_scores,
            phase2_scores: result.phase2_scores,
            section_scores: result.section_scores,
            consistency_level: result.consistency_level,
            profile_strength: result.profile_strength,
            strengths: result.strengths,
            recommendations: recs.map((r) => ({
                rank_position: r.rankPosition,
                match_score: r.matchScore,
                career: {
                    id: r.career.id,
                    name: r.career.name,
                    summary: r.career.summary,
                    description: r.career.description,
                    category: r.career.category,
                    riasec_codes: r.career.riasec_codes,
                },
            })),
        };

        let pdfUrl: string | undefined;
        if (generatePdf) {
            const buffer = await this.generatePdfBuffer(mapData);
            pdfUrl = await this.storage.uploadBuffer(buffer, 'application/pdf');
        }

        const updateData: { map_data: Prisma.InputJsonValue; pdf_url?: string } = {
            map_data: mapData as Prisma.InputJsonValue,
        };
        if (generatePdf) updateData.pdf_url = pdfUrl;

        const treasureMap = await this.prisma.treasureMap.upsert({
            where: { assessment_id: assessment.id },
            update: updateData,
            create: {
                assessment_id: assessment.id,
                map_data: mapData as Prisma.InputJsonValue,
                pdf_url: pdfUrl,
                share_token: randomUUID(),
            },
        });

        await this.badges.grantTreasureMap(session);

        return treasureMap;
    }

    async getByShareToken(shareToken: string) {
        const map = await this.prisma.treasureMap.findUnique({
            where: { share_token: shareToken },
        });
        if (!map) throw new NotFoundException('Carte introuvable');
        await this.prisma.treasureMap.update({
            where: { id: map.id },
            data: {
                view_count: { increment: 1 },
                last_viewed_at: new Date(),
            },
        });
        return map;
    }

    async getBySessionToken(sessionToken: string) {
        const session = await this.prisma.session.findUnique({
            where: { session_token: sessionToken },
            select: { id: true },
        });
        if (!session) throw new NotFoundException('Session introuvable');

        const map = await this.prisma.treasureMap.findFirst({
            where: { assessment: { session_id: session.id } },
            orderBy: { created_at: 'desc' },
        });
        if (!map) throw new NotFoundException('Carte introuvable');
        return map;
    }
}
