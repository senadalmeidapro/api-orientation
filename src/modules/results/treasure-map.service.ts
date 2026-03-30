import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ResultsService } from './results.service';
import { AssessmentStatus, RiasecType, Prisma } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { StorageService } from '../media/storage.service';
import { BadgesService } from '../badges/badges.service';
import { randomUUID } from 'crypto';

@Injectable()
export class TreasureMapService {
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
            where: { isActive: true },
        });

        const scored = careers
            .map((career) => {
                const codes = career.riasecCodes;
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
                const demandBoost = career.localDemand ? career.localDemand * 2 : 0;
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
                        resultId_careerId: {
                            resultId,
                            careerId: item.career.id,
                        },
                    },
                    update: {
                        matchScore: Math.min(100, item.score),
                        rankPosition: index + 1,
                    },
                    create: {
                        resultId,
                        careerId: item.career.id,
                        matchScore: Math.min(100, item.score),
                        rankPosition: index + 1,
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
            where: { sessionToken },
            select: { id: true },
        });
        if (!session) throw new NotFoundException('Session introuvable');

        const assessment = assessmentId
            ? await this.prisma.assessment.findFirst({
                  where: { id: assessmentId, sessionId: session.id },
              })
            : await this.prisma.assessment.findFirst({
                  where: { sessionId: session.id, status: AssessmentStatus.COMPLETED },
                  orderBy: { completedAt: 'desc' },
              });
        if (!assessment) {
            throw new NotFoundException('Aucun test disponible pour cette session');
        }

        let result = await this.prisma.assessmentResult.findUnique({
            where: { assessmentId: assessment.id },
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
            where: { resultId: result.id },
            include: { career: true },
            orderBy: { rankPosition: 'asc' },
            take: 6,
        });

        const recs = existingRecs.length
            ? existingRecs.map((r) => ({
                  rankPosition: r.rankPosition,
                  matchScore: r.matchScore,
                  career: r.career,
              }))
            : await this.computeRecommendations(
                  result.id,
                  result.phase2Code ?? result.phase1Code ?? '',
                  6,
              );

        const mapData = {
            generatedAt: new Date().toISOString(),
            phase1Code: result.phase1Code,
            phase2Code: result.phase2Code,
            phase1Scores: result.phase1Scores,
            phase2Scores: result.phase2Scores,
            sectionScores: result.sectionScores,
            consistencyLevel: result.consistencyLevel,
            profileStrength: result.profileStrength,
            strengths: result.strengths,
            recommendations: recs.map((r) => ({
                rankPosition: r.rankPosition,
                matchScore: r.matchScore,
                career: {
                    id: r.career.id,
                    name: r.career.name,
                    summary: r.career.summary,
                    description: r.career.description,
                    category: r.career.category,
                    riasecCodes: r.career.riasecCodes,
                },
            })),
        };

        let pdfUrl: string | undefined;
        if (generatePdf) {
            const buffer = await this.generatePdfBuffer(mapData);
            pdfUrl = await this.storage.uploadBuffer(buffer, 'application/pdf');
        }

        const updateData: { mapData: Prisma.InputJsonValue; pdfUrl?: string } = { mapData: mapData as Prisma.InputJsonValue };
        if (generatePdf) updateData.pdfUrl = pdfUrl;

        const treasureMap = await this.prisma.treasureMap.upsert({
            where: { assessmentId: assessment.id },
            update: updateData,
            create: {
                assessmentId: assessment.id,
                mapData: mapData as Prisma.InputJsonValue,
                pdfUrl,
                shareToken: randomUUID(),
            },
        });

        await this.badges.grantTreasureMap(session);

        return treasureMap;
    }

    async getByShareToken(shareToken: string) {
        const map = await this.prisma.treasureMap.findUnique({
            where: { shareToken },
        });
        if (!map) throw new NotFoundException('Carte introuvable');
        await this.prisma.treasureMap.update({
            where: { id: map.id },
            data: {
                viewCount: { increment: 1 },
                lastViewedAt: new Date(),
            },
        });
        return map;
    }

    async getBySessionToken(sessionToken: string) {
        const session = await this.prisma.session.findUnique({
            where: { sessionToken },
            select: { id: true },
        });
        if (!session) throw new NotFoundException('Session introuvable');

        const map = await this.prisma.treasureMap.findFirst({
            where: { assessment: { sessionId: session.id } },
            orderBy: { createdAt: 'desc' },
        });
        if (!map) throw new NotFoundException('Carte introuvable');
        return map;
    }
}
