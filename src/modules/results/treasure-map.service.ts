import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ResultsService } from './results.service';
import { TestStatus, TestType, RiasecType, Prisma } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { StorageService } from '../media/storage.service';
import { BadgesService } from '../badges/badges.service';
import { randomUUID } from 'crypto';

type TreasureMapRecommendation = {
  rankPosition: number;
  matchScore: number;
  career: {
    id: number;
    name: string;
    summary: string | null;
    description: string;
    category: string | null;
    riasecCodes: RiasecType[];
    localDemand: number | null;
    formationLevel: string | null;
    salaryRangeMin: number | null;
    salaryRangeMax: number | null;
    careerPath: string | null;
  };
  formations: Array<{
    id: number;
    title: string;
    degree: string;
    duration: string;
    field: string | null;
    university: {
      id: number;
      name: string;
      acronym: string;
      city: string | null;
      website: string;
    } | null;
    scholarships: Array<{
      id: number;
      title: string;
      provider: string;
      level: string | null;
      field: string | null;
      country: string | null;
      amountLabel: string | null;
      applicationCloseAt: string | null;
    }>;
  }>;
};

type TreasureMapPayload = {
  generatedAt: string;
  assessment: {
    id: string;
    type: TestType;
    status: TestStatus;
    startedAt: string;
    completedAt: string | null;
    completionPercentage: number;
  };
  generalCode: string | null;
  specificCode: string | null;
  dominantCode: string | null;
  riasecSummary: Array<{
    code: RiasecType;
    label: string;
    score: number;
    rank: number;
  }>;
  generalScores: Prisma.JsonValue | null;
  specificScores: Prisma.JsonValue | null;
  sectionScores: Prisma.JsonValue | null;
  sectionSummary: Array<{
    section: TestType;
    label: string;
    topCodes: string;
    scores: Array<{ code: RiasecType; score: number; rank: number }>;
  }>;
  consistencyLevel: string | null;
  consistencyLabel: string;
  profileStrength: string | null;
  profileStrengthLabel: string;
  strengths: string[];
  recommendations: TreasureMapRecommendation[];
  nextSteps: string[];
};

const riasecLabels: Record<RiasecType, string> = {
  R: 'Realiste',
  I: 'Investigateur',
  A: 'Artistique',
  S: 'Social',
  E: 'Entreprenant',
  C: 'Conventionnel',
};

const riasecDescriptions: Record<RiasecType, string> = {
  R: 'Aime les activites concretes, techniques, pratiques et les environnements ou l on manipule, construit ou repare.',
  I: 'Aime analyser, comprendre, resoudre des problemes et explorer des sujets scientifiques ou techniques.',
  A: 'Aime creer, imaginer, communiquer des idees et travailler dans des contextes ouverts et expressifs.',
  S: 'Aime aider, accompagner, former, soigner ou travailler en relation directe avec les autres.',
  E: 'Aime convaincre, entreprendre, diriger, vendre, organiser des projets et prendre des initiatives.',
  C: 'Aime structurer, classer, verifier, gerer des donnees et travailler avec methode et precision.',
};

const sectionLabels: Partial<Record<TestType, string>> = {
  OCCUPATIONS: 'Interets professionnels',
  APTITUDES: 'Aptitudes percues',
  PERSONALITY: 'Personnalite',
};

@Injectable()
export class TreasureMapService {
  private readonly logger = new Logger(TreasureMapService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly resultsService: ResultsService,
    private readonly storage: StorageService,
    private readonly badges: BadgesService,
  ) {}

  private buildWeights(specificCode: string) {
    const letters = specificCode.split('') as RiasecType[];
    const weights: Record<string, number> = {};
    if (letters[0]) weights[letters[0]] = 50;
    if (letters[1]) weights[letters[1]] = 30;
    if (letters[2]) weights[letters[2]] = 20;
    return weights;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private toNumber(value: unknown): number {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  }

  private extractScores(value: unknown): Record<RiasecType, number> {
    const empty: Record<RiasecType, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    if (!this.isRecord(value)) return empty;

    for (const code of Object.keys(empty) as RiasecType[]) {
      empty[code] = this.toNumber(value[code]);
    }
    return empty;
  }

  private toResultView(result: { riasecCode: string | null; scoresByCategory: unknown }) {
    const scores = this.isRecord(result.scoresByCategory) ? result.scoresByCategory : {};
    const generalScores = this.isRecord(scores.GENERALE)
      ? (scores.GENERALE as Prisma.JsonValue)
      : null;
    const specificScores = this.isRecord(scores.totalRaw)
      ? (scores.totalRaw as Prisma.JsonValue)
      : null;

    return {
      dominantCode: result.riasecCode,
      generalCode: result.riasecCode,
      specificCode: result.riasecCode,
      generalScores,
      specificScores,
    };
  }

  private sortScores(scores: Record<RiasecType, number>) {
    const order: RiasecType[] = ['R', 'I', 'A', 'S', 'E', 'C'];
    return [...order]
      .sort((a, b) => {
        const diff = scores[b] - scores[a];
        if (diff !== 0) return diff;
        return order.indexOf(a) - order.indexOf(b);
      })
      .map((code, index) => ({
        code,
        label: riasecLabels[code],
        score: scores[code],
        rank: index + 1,
      }));
  }

  private formatEnum(value: string | null | undefined): string {
    if (!value) return 'Non disponible';
    return value
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private formatCurrency(min: number | null, max: number | null) {
    if (min === null && max === null) return 'Non renseigne';
    if (min !== null && max !== null)
      return `${min.toLocaleString('fr-FR')} - ${max.toLocaleString('fr-FR')}`;
    if (min !== null) return `A partir de ${min.toLocaleString('fr-FR')}`;
    return `Jusqu a ${max?.toLocaleString('fr-FR')}`;
  }

  private buildSectionSummary(sectionScores: unknown): TreasureMapPayload['sectionSummary'] {
    if (!this.isRecord(sectionScores)) return [];
    const normalized = sectionScores.normalized;
    if (!this.isRecord(normalized)) return [];

    return (Object.keys(sectionLabels) as TestType[])
      .map((section) => {
        const scores = this.sortScores(this.extractScores(normalized[section])).map(
          ({ code, score, rank }) => ({ code, score, rank }),
        );
        return {
          section,
          label: sectionLabels[section] ?? section,
          topCodes: scores
            .slice(0, 3)
            .map((item) => item.code)
            .join(''),
          scores,
        };
      })
      .filter((item) => item.scores.some((score) => score.score > 0));
  }

  private buildNextSteps(mapData: Omit<TreasureMapPayload, 'nextSteps'>): string[] {
    const steps = [
      'Comparer les trois premiers metiers recommandes avec vos envies, contraintes et opportunites locales.',
      'Identifier une formation concrete pour chaque metier prioritaire.',
      'Contacter au moins une universite ou un centre de formation pour verifier les conditions d admission.',
      'Chercher un stage, une immersion ou un entretien metier avant de prendre une decision definitive.',
    ];

    if (mapData.consistencyLevel === 'FAIBLE') {
      steps.unshift(
        'Reprendre les resultats avec un conseiller: vos reponses montrent une coherence faible entre les categorys.',
      );
    }

    if (mapData.recommendations.some((rec) => rec.formations.length > 0)) {
      steps.push(
        'Verifier les bourses associees aux formations recommandees avant la date limite.',
      );
    }

    return steps;
  }

  private writeTitle(doc: PDFKit.PDFDocument, title: string, subtitle?: string) {
    const left = doc.page.margins.left;
    const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    doc.fontSize(21).fillColor('#172554').text(title, left, doc.y, {
      width,
      align: 'center',
    });

    if (subtitle) {
      doc.moveDown(0.35);
      doc.fontSize(10).fillColor('#6b7280').text(subtitle, left, doc.y, {
        width,
        align: 'center',
      });
    }

    doc.moveDown(1.2);
  }

  private ensureSpace(doc: PDFKit.PDFDocument, requiredHeight: number): boolean {
    const bottom = doc.page.height - doc.page.margins.bottom - 20;

    if (doc.y + requiredHeight > bottom) {
      doc.addPage();
      return true;
    }

    return false;
  }

  private writeSection(doc: PDFKit.PDFDocument, title: string) {
    this.ensureSpace(doc, 55);

    const left = doc.page.margins.left;
    const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    doc.moveDown(0.6);
    const y = doc.y;

    doc.roundedRect(left, y + 1, 4, 22, 2).fill('#2563eb');
    doc
      .fontSize(14)
      .fillColor('#172554')
      .font('Helvetica-Bold')
      .text(title, left + 14, y, {
        width: width - 14,
        align: 'left',
      });
    doc.moveDown(0.55);
  }

  private writeKeyValue(doc: PDFKit.PDFDocument, label: string, value: string | number | null) {
    this.ensureSpace(doc, 22);
    const text = value === null || value === undefined || value === '' ? 'Non disponible' : value;
    doc
      .fontSize(10)
      .fillColor('#6b7280')
      .font('Helvetica-Bold')
      .text(`${label}: `, doc.page.margins.left, doc.y, { continued: true })
      .fillColor('#1f2937')
      .font('Helvetica')
      .text(String(text));
  }

  private writeParagraph(doc: PDFKit.PDFDocument, text: string) {
    this.ensureSpace(doc, 35);
    doc.fontSize(10).fillColor('#374151').font('Helvetica').text(text, {
      align: 'left',
      lineGap: 3,
    });
    doc.moveDown(0.2);
  }

  private writeBullet(doc: PDFKit.PDFDocument, text: string, indent = 12) {
    this.ensureSpace(doc, 25);
    const left = doc.page.margins.left + indent;
    doc.circle(left, doc.y + 5, 2).fill('#2563eb');
    doc
      .fontSize(9.5)
      .fillColor('#374151')
      .font('Helvetica')
      .text(text, left + 9, doc.y, {
        width: doc.page.width - doc.page.margins.right - left - 9,
        lineGap: 2,
      });
    doc.moveDown(0.12);
  }

  private writeScoreTable(
    doc: PDFKit.PDFDocument,
    scores: Array<{ code: RiasecType; label?: string; score: number; rank: number }>,
  ) {
    if (scores.length === 0) return;

    const rowHeight = 24;
    const headerHeight = 24;
    const rowsPerPage = 22;
    const maxScore = Math.max(...scores.map((item) => item.score), 100);
    const left = doc.page.margins.left;
    const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const xCode = left + 8;
    const xLabel = left + 45;
    const xScore = left + 185;
    const xBar = left + 245;
    const barWidth = Math.min(180, width - 255);

    let index = 0;
    while (index < scores.length) {
      const remaining = scores.length - index;
      const count = Math.min(remaining, rowsPerPage);
      const requiredHeight = headerHeight + count * rowHeight + 12;

      this.ensureSpace(doc, requiredHeight);

      const tableTop = doc.y;
      doc.roundedRect(left, tableTop, width, headerHeight, 4).fill('#172554');
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#ffffff');
      doc.text('Rang', xCode, tableTop + 7);
      doc.text('Profil', xLabel, tableTop + 7);
      doc.text('Score', xScore, tableTop + 7);
      doc.text('Lecture', xBar, tableTop + 7);

      for (let row = 0; row < count; row++) {
        const item = scores[index + row];
        const y = tableTop + headerHeight + row * rowHeight;

        if (row % 2 === 0) {
          doc.rect(left, y, width, rowHeight).fill('#f8fafc');
        }

        const isTop = item!.rank === 1;
        doc
          .fontSize(8.5)
          .font(isTop ? 'Helvetica-Bold' : 'Helvetica')
          .fillColor(isTop ? '#1d4ed8' : '#374151');
        doc.text(String(item!.rank), xCode, y + 8);
        doc.text(`${item!.code} - ${item!.label ?? riasecLabels[item!.code]}`, xLabel, y + 8);
        doc
          .font('Helvetica-Bold')
          .fillColor('#172554')
          .text(String(item!.score), xScore, y + 8);

        const progress = Math.max(0, Math.min(1, item!.score / Math.max(maxScore, 1)));
        const progressWidth = Math.max(0, Math.round(progress * barWidth));
        doc.roundedRect(xBar, y + 9, barWidth, 6, 3).fill('#e5e7eb');
        if (progressWidth > 0) {
          doc.roundedRect(xBar, y + 9, progressWidth, 6, 3).fill(isTop ? '#1d4ed8' : '#2563eb');
        }
      }

      doc.y = tableTop + headerHeight + count * rowHeight + 10;
      index += count;

      if (index < scores.length) {
        doc.addPage();
      }
    }
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

  private async generatePdfBuffer(mapData: TreasureMapPayload) {
    const doc = new PDFDocument({
      margin: 48,
      size: 'A4',
      bufferPages: true,
      info: {
        Title: 'Rapport orientation RIASEC',
        Subject: 'Carte au tresor orientation',
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    this.writeTitle(
      doc,
      'Rapport d orientation RIASEC',
      `Genere le ${new Date(mapData.generatedAt).toLocaleDateString('fr-FR')} - Assessment ${mapData.assessment.id}`,
    );

    this.writeSection(doc, '1. Synthese du profil');
    this.writeKeyValue(doc, 'Code dominant', mapData.dominantCode);
    this.writeKeyValue(doc, 'Code générales', mapData.generalCode);
    this.writeKeyValue(doc, 'Code catégorie', mapData.specificCode);
    this.writeKeyValue(doc, 'Force du profil', mapData.profileStrengthLabel);
    this.writeKeyValue(doc, 'Coherence générales / catégorie', mapData.consistencyLabel);
    this.writeKeyValue(doc, 'Type de test', this.formatEnum(mapData.assessment.type));
    this.writeKeyValue(doc, 'Progression', `${mapData.assessment.completionPercentage}%`);

    const topProfile = mapData.riasecSummary[0];
    if (topProfile) {
      doc.moveDown(0.6);
      this.writeParagraph(
        doc,
        `Votre profil principal est ${topProfile.code} - ${topProfile.label}. ${riasecDescriptions[topProfile.code]}`,
      );
    }

    if (mapData.riasecSummary.length > 1) {
      const second = mapData.riasecSummary[1];
      const third = mapData.riasecSummary[2];
      const complements = [second, third]
        .filter((item): item is TreasureMapPayload['riasecSummary'][number] => Boolean(item))
        .map((item) => `${item.code} - ${item.label}`)
        .join(', ');
      this.writeParagraph(doc, `Profils complementaires: ${complements}.`);
    }

    this.writeSection(doc, '2. Scores RIASEC globaux');
    this.writeScoreTable(doc, mapData.riasecSummary);

    if (mapData.sectionSummary.length > 0) {
      this.writeSection(doc, '3. Detail par section');

      for (const section of mapData.sectionSummary) {
        this.ensureSpace(doc, 180);
        const left = doc.page.margins.left;
        const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

        doc
          .fontSize(11)
          .fillColor('#172554')
          .font('Helvetica-Bold')
          .text(section.label.toUpperCase(), left, doc.y, { width, align: 'left' });
        doc.moveDown(0.15);
        doc
          .fontSize(7.5)
          .font('Helvetica-Bold')
          .fillColor('#1d4ed8')
          .text(`CODE ${section.topCodes || 'N/A'}`, left, doc.y);
        doc.moveDown(0.45);

        this.writeScoreTable(
          doc,
          section.scores.map((score) => ({
            ...score,
            label: riasecLabels[score.code],
          })),
        );
        doc.moveDown(0.25);
      }
    }

    this.writeSection(doc, '4. Recommandations metiers');

    if (mapData.recommendations.length === 0) {
      this.writeParagraph(doc, 'Aucune recommandation metier disponible pour ce resultat.');
    }

    for (const rec of mapData.recommendations) {
      this.ensureSpace(doc, 105);

      doc
        .fontSize(12)
        .fillColor('#172554')
        .font('Helvetica-Bold')
        .text(`${rec.rankPosition}. ${rec.career.name}`, doc.page.margins.left, doc.y);

      doc
        .fontSize(9)
        .fillColor('#2563eb')
        .font('Helvetica-Bold')
        .text(`${rec.matchScore}% d adequation`, doc.page.margins.left, doc.y + 2);
      doc.moveDown(0.35);

      this.writeKeyValue(doc, 'Codes RIASEC metier', rec.career.riasecCodes.join(', '));
      this.writeKeyValue(doc, 'Demande locale', rec.career.localDemand ?? 'Non renseignee');
      this.writeKeyValue(doc, 'Niveau de formation', rec.career.formationLevel ?? 'Non renseigne');
      this.writeKeyValue(
        doc,
        'Fourchette salariale',
        this.formatCurrency(rec.career.salaryRangeMin, rec.career.salaryRangeMax),
      );

      if (rec.career.summary || rec.career.description) {
        this.writeParagraph(doc, rec.career.summary ?? rec.career.description);
      }

      if (rec.career.careerPath) {
        this.writeBullet(doc, `Parcours possible: ${rec.career.careerPath}`);
      }

      if (rec.formations.length > 0) {
        this.ensureSpace(doc, 35);
        doc
          .fontSize(10)
          .fillColor('#172554')
          .font('Helvetica-Bold')
          .text('Formations associees', doc.page.margins.left, doc.y);
        doc.moveDown(0.2);

        for (const formation of rec.formations.slice(0, 3)) {
          const university = formation.university
            ? `${formation.university.name}${formation.university.city ? `, ${formation.university.city}` : ''}`
            : 'Universite non renseignee';

          this.writeBullet(
            doc,
            `${formation.title} (${formation.degree}, ${formation.duration}) - ${university}`,
          );

          for (const scholarship of formation.scholarships.slice(0, 2)) {
            const deadline = scholarship.applicationCloseAt
              ? new Date(scholarship.applicationCloseAt).toLocaleDateString('fr-FR')
              : 'date limite non renseignee';

            this.writeBullet(
              doc,
              `Bourse: ${scholarship.title} - ${scholarship.provider} (${deadline})`,
              24,
            );
          }
        }
      }

      doc.moveDown(0.65);
    }

    this.writeSection(doc, '5. Prochaines actions');
    for (const step of mapData.nextSteps) {
      this.writeBullet(doc, step);
    }

    const pageRange = doc.bufferedPageRange();
    for (let i = pageRange.start; i < pageRange.start + pageRange.count; i++) {
      doc.switchToPage(i);
      const footerY = doc.page.height - 30;

      doc
        .moveTo(doc.page.margins.left, footerY - 8)
        .lineTo(doc.page.width - doc.page.margins.right, footerY - 8)
        .strokeColor('#e5e7eb')
        .lineWidth(0.5)
        .stroke();

      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text('Rapport d orientation RIASEC', doc.page.margins.left, footerY);

      doc.text(`Page ${i + 1} / ${pageRange.count}`, doc.page.margins.left, footerY, {
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
        align: 'right',
      });
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
      where: { sessionToken: sessionToken },
      select: { id: true },
    });
    if (!session) throw new NotFoundException('Session introuvable');

    const assessment = assessmentId
      ? await this.prisma.assessment.findFirst({
          where: { id: assessmentId, sessionId: session.id },
        })
      : await this.prisma.assessment.findFirst({
          where: { sessionId: session.id, status: TestStatus.COMPLETED },
          orderBy: { completedAt: 'desc' },
        });
    if (!assessment) {
      throw new NotFoundException('Aucun test disponible pour cette session');
    }

    let result = await this.prisma.assessmentResult.findUnique({
      where: { assessmentId: assessment.id },
    });
    if (!result) {
      if (assessment.status !== TestStatus.COMPLETED) {
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

    const resultView = this.toResultView(result);
    const recs = existingRecs.length
      ? existingRecs.map((r) => ({
          rankPosition: r.rankPosition,
          matchScore: r.matchScore,
          career: r.career,
        }))
      : await this.computeRecommendations(result.id, resultView.dominantCode ?? '', 6);

    const recommendedCareerIds = recs.map((rec) => rec.career.id);
    const enrichedCareers = await this.prisma.career.findMany({
      where: { id: { in: recommendedCareerIds } },
      include: {
        institutions: {
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
          include: {
            formation: {
              include: {
                university: {
                  include: {
                    scholarships: {
                      include: {
                        scholarship: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    const enrichedCareerMap = new Map(enrichedCareers.map((career) => [career.id, career]));

    const baseScores =
      resultView.specificScores &&
      this.sortScores(this.extractScores(resultView.specificScores)).some((s) => s.score > 0)
        ? this.extractScores(resultView.specificScores)
        : this.extractScores(resultView.generalScores);
    const riasecSummary = this.sortScores(baseScores);
    const dominantCode =
      resultView.dominantCode ??
      riasecSummary
        .slice(0, 3)
        .map((item) => item.code)
        .join('');

    const mapDataBase = {
      generatedAt: new Date().toISOString(),
      assessment: {
        id: assessment.id,
        type: assessment.type,
        status: assessment.status,
        startedAt: assessment.startedAt.toISOString(),
        completedAt: assessment.completedAt?.toISOString() ?? null,
        completionPercentage: assessment.completionPercentage,
      },
      generalCode: resultView.generalCode,
      specificCode: resultView.specificCode,
      dominantCode: dominantCode || null,
      riasecSummary,
      generalScores: resultView.generalScores,
      specificScores: resultView.specificScores,
      sectionScores: result.scoresByCategory,
      sectionSummary: this.buildSectionSummary(result.scoresByCategory),
      consistencyLevel: result.consistencyLevel,
      consistencyLabel: this.formatEnum(result.consistencyLevel),
      profileStrength: result.profileStrength,
      profileStrengthLabel: this.formatEnum(result.profileStrength),
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
          localDemand: r.career.localDemand,
          formationLevel: r.career.formationLevel,
          salaryRangeMin: r.career.salaryRangeMin,
          salaryRangeMax: r.career.salaryRangeMax,
          careerPath: r.career.careerPath,
        },
        formations: (
          enrichedCareerMap.get(r.career.id)?.institutions?.map((link) => {
            const formation = link.formation;
            const university = formation.university;
            const now = new Date();
            return {
              id: formation.id,
              title: formation.title,
              degree: formation.degree,
              duration: formation.duration,
              field: formation.field,
              university: university
                ? {
                    id: university.id,
                    name: university.name,
                    acronym: university.acronym,
                    city: university.city,
                    website: university.website,
                  }
                : null,
              scholarships:
                university?.scholarships
                  .map((item) => item.scholarship)
                  .filter((scholarship) => {
                    if (!scholarship.isActive) return false;
                    return !(
                      scholarship.applicationCloseAt && scholarship.applicationCloseAt < now
                    );
                  })
                  .slice(0, 3)
                  .map((scholarship) => ({
                    id: scholarship.id,
                    title: scholarship.title,
                    provider: scholarship.provider,
                    level: scholarship.level,
                    field: scholarship.field,
                    country: scholarship.country,
                    amountLabel: scholarship.amountLabel,
                    applicationCloseAt: scholarship.applicationCloseAt?.toISOString() ?? null,
                  })) ?? [],
            };
          }) ?? []
        ).slice(0, 4),
      })),
    } satisfies Omit<TreasureMapPayload, 'nextSteps'>;

    const mapData = {
      ...mapDataBase,
      nextSteps: this.buildNextSteps(mapDataBase),
    } satisfies TreasureMapPayload;

    let pdfUrl: string | null = null;
    if (generatePdf) {
      const buffer = await this.generatePdfBuffer(mapData);
      pdfUrl = await this.storage.uploadBuffer(buffer, 'application/pdf');
    }

    const updateData: Prisma.TreasureMapUpdateInput = {
      mapData: mapData,
      ...(generatePdf ? { pdfUrl } : {}),
    };

    const treasureMap = await this.prisma.treasureMap.upsert({
      where: { assessmentId: assessment.id },
      update: updateData,
      create: {
        assessmentId: assessment.id,
        mapData: mapData,
        pdfUrl,
        shareToken: randomUUID(),
      },
    });

    await this.badges.grantTreasureMap(session);

    return treasureMap;
  }

  async getByShareToken(shareToken: string) {
    const map = await this.prisma.treasureMap.findUnique({
      where: { shareToken: shareToken },
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
