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
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
  }

  private extractScores(value: unknown): Record<RiasecType, number> {
    const empty: Record<RiasecType, number> = {
      R: 0,
      I: 0,
      A: 0,
      S: 0,
      E: 0,
      C: 0,
    };

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
    if (min === null && max === null) {
      return 'Non renseigne';
    }

    if (min !== null && max !== null) {
      return `${min.toLocaleString('fr-FR')} - ${max.toLocaleString('fr-FR')}`;
    }

    if (min !== null) {
      return `A partir de ${min.toLocaleString('fr-FR')}`;
    }

    return `Jusqu a ${max?.toLocaleString('fr-FR')}`;
  }

  private buildSectionSummary(sectionScores: unknown): TreasureMapPayload['sectionSummary'] {
    if (!this.isRecord(sectionScores)) return [];

    const normalized = sectionScores.normalized;

    if (!this.isRecord(normalized)) return [];

    return (Object.keys(sectionLabels) as TestType[])
      .map((section) => {
        const scores = this.sortScores(this.extractScores(normalized[section])).map(
          ({ code, score, rank }) => ({
            code,
            score,
            rank,
          }),
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

  // ============================================================
  // PDF - PRESENTATION
  // ============================================================

  private readonly pdfColors = {
    navy: '#172554',
    blue: '#2563EB',
    blueDark: '#1D4ED8',
    blueLight: '#EFF6FF',
    blueSoft: '#DBEAFE',
    text: '#1F2937',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    background: '#F8FAFC',
    white: '#FFFFFF',
    green: '#059669',
    greenLight: '#ECFDF5',
    orange: '#D97706',
    orangeLight: '#FFFBEB',
  };

  private getPdfLayout(doc: PDFKit.PDFDocument) {
    return {
      left: doc.page.margins.left,
      right: doc.page.width - doc.page.margins.right,
      width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
    };
  }

  // ------------------------------------------------------------
  // FIX PAGES BLANCHES : seuils de saut de page dynamiques,
  // bases sur la vraie hauteur de page (et non des valeurs fixes
  // comme 690/710/750 qui coupaient bien avant le bas reel de la
  // page, ~794pt en A4 avec une marge de 48). Aucun changement de
  // style, uniquement la logique de pagination.
  // ------------------------------------------------------------
  private getPageBottom(doc: PDFKit.PDFDocument): number {
    return doc.page.height - doc.page.margins.bottom;
  }

  private ensureSpace(doc: PDFKit.PDFDocument, requiredHeight: number, buffer = 15) {
    const bottom = this.getPageBottom(doc);

    if (doc.y + requiredHeight > bottom - buffer) {
      doc.addPage();
    }
  }

  private drawRoundedCard(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    width: number,
    height: number,
    background: string,
    border?: string,
  ) {
    doc.roundedRect(x, y, width, height, 7).fillAndStroke(background, border ?? background);
  }

  private writeTitle(doc: PDFKit.PDFDocument, title: string, subtitle?: string) {
    const layout = this.getPdfLayout(doc);

    doc
      .fillColor(this.pdfColors.navy)
      .fontSize(24)
      .font('Helvetica-Bold')
      .text(title, layout.left, doc.y, {
        width: layout.width,
        align: 'center',
      });

    if (subtitle) {
      doc.moveDown(0.45);

      doc
        .fillColor(this.pdfColors.textMuted)
        .fontSize(10)
        .font('Helvetica')
        .text(subtitle, layout.left, doc.y, {
          width: layout.width,
          align: 'center',
        });
    }

    doc.moveDown(1);
  }

  private writeSection(doc: PDFKit.PDFDocument, title: string, number?: string) {
    // Un titre de section prend environ 35-40pt (barre + libelle + marge).
    this.ensureSpace(doc, 45);

    const layout = this.getPdfLayout(doc);

    doc.moveDown(0.7);

    const y = doc.y;

    doc.roundedRect(layout.left, y, 5, 25, 2).fill(this.pdfColors.blue);

    if (number) {
      doc
        .fillColor(this.pdfColors.blue)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text(number, layout.left + 16, y + 2);
    }

    doc
      .fillColor(this.pdfColors.navy)
      .fontSize(15)
      .font('Helvetica-Bold')
      .text(title, layout.left + 16, y + 1, {
        width: layout.width - 16,
      });

    doc.moveDown(0.8);
  }

  private writeKeyValue(doc: PDFKit.PDFDocument, label: string, value: string | number | null) {
    const layout = this.getPdfLayout(doc);

    const text = value === null || value === undefined || value === '' ? 'Non disponible' : value;

    this.ensureSpace(doc, 14);

    doc
      .fillColor(this.pdfColors.textMuted)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(`${label}:`, layout.left, doc.y, {
        continued: true,
      })
      .fillColor(this.pdfColors.text)
      .font('Helvetica')
      .text(` ${String(text)}`);

    doc.moveDown(0.15);
  }

  private writeParagraph(doc: PDFKit.PDFDocument, text: string) {
    const layout = this.getPdfLayout(doc);

    doc.fontSize(9.5).font('Helvetica');

    const estimatedHeight = doc.heightOfString(text, {
      width: layout.width,
      lineGap: 3,
    });

    this.ensureSpace(doc, estimatedHeight);

    doc
      .fontSize(9.5)
      .font('Helvetica')
      .fillColor(this.pdfColors.text)
      .text(text, layout.left, doc.y, {
        width: layout.width,
        align: 'left',
        lineGap: 3,
      });

    doc.moveDown(0.25);
  }

  private writeBullet(doc: PDFKit.PDFDocument, text: string, indent = 12) {
    const layout = this.getPdfLayout(doc);

    const bulletX = layout.left + indent;
    const textWidth = layout.right - bulletX - 9;

    doc.fontSize(9).font('Helvetica');

    const estimatedHeight = doc.heightOfString(text, {
      width: textWidth,
      lineGap: 2,
    });

    this.ensureSpace(doc, estimatedHeight + 4);

    doc.circle(bulletX, doc.y + 4, 2).fill(this.pdfColors.blue);

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(this.pdfColors.text)
      .text(text, bulletX + 9, doc.y, {
        width: textWidth,
        lineGap: 2,
      });

    doc.moveDown(0.15);
  }

  private writeInfoCards(
    doc: PDFKit.PDFDocument,
    items: Array<{
      label: string;
      value: string;
      accent?: string;
    }>,
  ) {
    const layout = this.getPdfLayout(doc);

    const gap = 10;

    const cardWidth = (layout.width - gap * (items.length - 1)) / items.length;

    const cardHeight = 65;

    this.ensureSpace(doc, cardHeight + 16);

    const startY = doc.y;

    items.forEach((item, index) => {
      const x = layout.left + index * (cardWidth + gap);

      const accent = item.accent ?? this.pdfColors.blue;

      this.drawRoundedCard(
        doc,
        x,
        startY,
        cardWidth,
        cardHeight,
        this.pdfColors.background,
        this.pdfColors.border,
      );

      doc.rect(x, startY, 4, cardHeight).fill(accent);

      doc
        .fontSize(7.5)
        .font('Helvetica-Bold')
        .fillColor(this.pdfColors.textMuted)
        .text(item.label.toUpperCase(), x + 14, startY + 12, {
          width: cardWidth - 24,
        });

      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor(this.pdfColors.navy)
        .text(item.value, x + 14, startY + 30, {
          width: cardWidth - 24,
        });
    });

    doc.y = startY + cardHeight + 16;
  }

  private writeProfileHero(doc: PDFKit.PDFDocument, mapData: TreasureMapPayload) {
    const layout = this.getPdfLayout(doc);

    const topProfile = mapData.riasecSummary[0];

    if (!topProfile) return;

    const height = 105;

    this.ensureSpace(doc, height + 18);

    const y = doc.y;

    this.drawRoundedCard(
      doc,
      layout.left,
      y,
      layout.width,
      height,
      this.pdfColors.blueLight,
      this.pdfColors.blueSoft,
    );

    doc.circle(layout.left + 48, y + 52, 30).fill(this.pdfColors.blue);

    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor(this.pdfColors.white)
      .text(topProfile.code, layout.left + 33, y + 39, {
        width: 30,
        align: 'center',
      });

    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .fillColor(this.pdfColors.blueDark)
      .text('PROFIL DOMINANT', layout.left + 95, y + 20);

    doc
      .fontSize(17)
      .font('Helvetica-Bold')
      .fillColor(this.pdfColors.navy)
      .text(topProfile.label, layout.left + 95, y + 36);

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(this.pdfColors.text)
      .text(riasecDescriptions[topProfile.code], layout.left + 95, y + 60, {
        width: layout.width - 120,
        lineGap: 2,
      });

    doc.y = y + height + 18;
  }

  private writeScoreTable(
    doc: PDFKit.PDFDocument,
    scores: Array<{
      code: RiasecType;
      label?: string;
      score: number;
      rank: number;
    }>,
  ) {
    const layout = this.getPdfLayout(doc);

    const tableX = layout.left;

    const rankWidth = 38;
    const profileWidth = 145;
    const scoreWidth = 45;

    const xRank = tableX + 10;

    const xProfile = tableX + rankWidth;

    const xScore = xProfile + profileWidth;

    const xBar = xScore + scoreWidth;

    const barWidth = layout.right - xBar - 10;

    const headerHeight = 25;
    const rowHeight = 29;

    const totalHeight = headerHeight + scores.length * rowHeight;

    this.ensureSpace(doc, totalHeight);

    const tableTop = doc.y;

    doc.roundedRect(tableX, tableTop, layout.width, headerHeight, 5).fill(this.pdfColors.navy);

    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .fillColor(this.pdfColors.white)
      .text('RANG', xRank, tableTop + 8)
      .text('PROFIL', xProfile, tableTop + 8)
      .text('SCORE', xScore, tableTop + 8)
      .text('LECTURE', xBar, tableTop + 8);

    for (let index = 0; index < scores.length; index++) {
      const item = scores[index];

      const y = tableTop + headerHeight + index * rowHeight;

      if (index % 2 === 0) {
        doc.rect(tableX, y, layout.width, rowHeight).fill(this.pdfColors.background);
      }

      const isTop = item!.rank === 1;

      doc
        .fontSize(8.5)
        .font(isTop ? 'Helvetica-Bold' : 'Helvetica')
        .fillColor(isTop ? this.pdfColors.blueDark : this.pdfColors.text)
        .text(String(item!.rank), xRank, y + 9);

      doc
        .fontSize(8.5)
        .font('Helvetica')
        .fillColor(this.pdfColors.text)
        .text(`${item!.code} - ${item!.label ?? riasecLabels[item!.code]}`, xProfile, y + 9, {
          width: profileWidth - 10,
        });

      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor(this.pdfColors.navy)
        .text(String(item!.score), xScore, y + 9);

      const maxScore = Math.max(...scores.map((score) => score.score), 100);

      const progress = item!.score / Math.max(maxScore, 1);

      const progressWidth = Math.max(4, Math.round(progress * barWidth));

      const barY = y + 10;

      doc.roundedRect(xBar, barY, barWidth, 7, 3).fill(this.pdfColors.border);

      doc
        .roundedRect(xBar, barY, progressWidth, 7, 3)
        .fill(isTop ? this.pdfColors.blueDark : this.pdfColors.blue);
    }

    doc.y = tableTop + totalHeight + 12;
  }

  private writeSectionSubtitle(doc: PDFKit.PDFDocument, title: string, code: string) {
    this.ensureSpace(doc, 55);

    const layout = this.getPdfLayout(doc);

    const y = doc.y;

    doc
      .fillColor(this.pdfColors.navy)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(title.toUpperCase(), layout.left, y);

    doc.roundedRect(layout.left, y + 18, 100, 18, 8).fill(this.pdfColors.blueLight);

    doc
      .fontSize(7.5)
      .font('Helvetica-Bold')
      .fillColor(this.pdfColors.blueDark)
      .text(`CODE ${code || 'N/A'}`, layout.left + 10, y + 24);

    doc.y = y + 50;
  }

  // ------------------------------------------------------------
  // FIX PAGES BLANCHES : l'ancienne version reservait un espace
  // fixe de 420pt avant chaque carte de recommandation (bien plus
  // que necessaire dans la majorite des cas), ce qui declenchait un
  // saut de page quasi systematique et laissait des pages a moitie
  // (ou quasi) vides. On calcule maintenant une estimation reelle
  // de la hauteur de la carte a partir de son contenu.
  // ------------------------------------------------------------
  private estimateRecommendationCardHeight(
    doc: PDFKit.PDFDocument,
    rec: TreasureMapRecommendation,
  ): number {
    const layout = this.getPdfLayout(doc);
    const cardWidth = layout.width;

    let height = 48 + 12; // header + marge

    const summaryText = rec.career.summary ?? rec.career.description;

    if (summaryText) {
      doc.fontSize(9).font('Helvetica');
      height += doc.heightOfString(summaryText, { width: cardWidth, lineGap: 2 }) + 8;
    }

    height += 52 + 12; // ligne des 4 mini-cartes d'info

    if (rec.career.careerPath) {
      doc.fontSize(8.5).font('Helvetica');
      height +=
        14 + doc.heightOfString(rec.career.careerPath, { width: cardWidth, lineGap: 2 }) + 10;
    }

    if (rec.formations.length > 0) {
      height += 14;

      for (const formation of rec.formations.slice(0, 3)) {
        height += 18;
        height += Math.min(formation.scholarships.length, 2) * 18;
      }

      height += 5;
    }

    return height + 28; // bordure + marge finale de la carte
  }

  private writeRecommendationCard(doc: PDFKit.PDFDocument, rec: TreasureMapRecommendation) {
    const layout = this.getPdfLayout(doc);

    const estimatedHeight = this.estimateRecommendationCardHeight(doc, rec);

    this.ensureSpace(doc, estimatedHeight, 10);

    const startY = doc.y;

    const cardWidth = layout.width;

    const headerHeight = 48;

    this.drawRoundedCard(doc, layout.left, startY, cardWidth, 1, this.pdfColors.border);

    doc.roundedRect(layout.left, startY, cardWidth, headerHeight, 7).fill(this.pdfColors.navy);

    doc.circle(layout.left + 25, startY + 24, 14).fill(this.pdfColors.blue);

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(this.pdfColors.white)
      .text(String(rec.rankPosition), layout.left + 17, startY + 20, {
        width: 16,
        align: 'center',
      });

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor(this.pdfColors.white)
      .text(rec.career.name, layout.left + 50, startY + 13, {
        width: cardWidth - 160,
      });

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(this.pdfColors.white)
      .text(`${rec.matchScore}%`, layout.right - 75, startY + 10, {
        width: 55,
        align: 'right',
      });

    doc
      .fontSize(6.5)
      .font('Helvetica')
      .fillColor(this.pdfColors.blueSoft)
      .text("D'ADEQUATION", layout.right - 75, startY + 29, {
        width: 55,
        align: 'right',
      });

    let y = startY + headerHeight + 12;

    if (rec.career.summary || rec.career.description) {
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(this.pdfColors.text)
        .text(rec.career.summary ?? rec.career.description, layout.left, y, {
          width: cardWidth,
          lineGap: 2,
        });

      y = doc.y + 8;
    }

    const infoItems = [
      {
        label: 'CODES RIASEC',
        value: rec.career.riasecCodes.join(' · '),
      },
      {
        label: 'DEMANDE LOCALE',
        value: rec.career.localDemand ?? 'Non renseignee',
      },
      {
        label: 'FORMATION',
        value: rec.career.formationLevel ?? 'Non renseignee',
      },
      {
        label: 'REMUNERATION',
        value: this.formatCurrency(rec.career.salaryRangeMin, rec.career.salaryRangeMax),
      },
    ];

    const infoGap = 8;

    const infoWidth = (cardWidth - infoGap * 3) / 4;

    const infoHeight = 52;

    infoItems.forEach((item, index) => {
      const x = layout.left + index * (infoWidth + infoGap);

      this.drawRoundedCard(
        doc,
        x,
        y,
        infoWidth,
        infoHeight,
        this.pdfColors.background,
        this.pdfColors.border,
      );

      doc
        .fontSize(6.5)
        .font('Helvetica-Bold')
        .fillColor(this.pdfColors.textMuted)
        .text(item.label, x + 8, y + 9, {
          width: infoWidth - 16,
        });

      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor(this.pdfColors.navy)
        .text(String(item.value), x + 8, y + 25, {
          width: infoWidth - 16,
          lineGap: 1,
        });
    });

    y += infoHeight + 12;

    if (rec.career.careerPath) {
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor(this.pdfColors.navy)
        .text('PARCOURS POSSIBLE', layout.left, y);

      y += 14;

      doc
        .fontSize(8.5)
        .font('Helvetica')
        .fillColor(this.pdfColors.text)
        .text(rec.career.careerPath, layout.left, y, {
          width: cardWidth,
        });

      y = doc.y + 10;
    }

    if (rec.formations.length > 0) {
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor(this.pdfColors.navy)
        .text('FORMATIONS ASSOCIEES', layout.left, y);

      y += 14;

      for (const formation of rec.formations.slice(0, 3)) {
        const university = formation.university
          ? `${formation.university.name}${
              formation.university.city ? `, ${formation.university.city}` : ''
            }`
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

      y = doc.y + 5;
    }

    const finalHeight = Math.max(y - startY + 12, headerHeight + 30);

    doc.roundedRect(layout.left, startY, cardWidth, finalHeight, 7).stroke(this.pdfColors.border);

    doc.y = startY + finalHeight + 16;
  }

  private writeNextSteps(doc: PDFKit.PDFDocument, steps: string[]) {
    const layout = this.getPdfLayout(doc);

    for (let index = 0; index < steps.length; index++) {
      const step = steps[index];

      doc.fontSize(9).font('Helvetica');

      const stepHeight = doc.heightOfString(step!, {
        width: layout.width - 45,
        lineGap: 2,
      });

      this.ensureSpace(doc, Math.max(stepHeight, 22));

      const y = doc.y;

      doc.circle(layout.left + 12, y + 11, 11).fill(this.pdfColors.blue);

      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor(this.pdfColors.white)
        .text(String(index + 1), layout.left + 5, y + 7, {
          width: 14,
          align: 'center',
        });

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(this.pdfColors.text)
        .text(step!, layout.left + 35, y + 2, {
          width: layout.width - 45,
          lineGap: 2,
        });

      doc.moveDown(0.6);
    }
  }

  private async computeRecommendations(resultId: string, baseCode: string, limit = 6) {
    if (!baseCode) return [];

    const weights = this.buildWeights(baseCode);

    const careers = await this.prisma.career.findMany({
      where: {
        isActive: true,
      },
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

        if (matched === 0) {
          return {
            career,
            score: 0,
          };
        }

        const baseScore = Math.round(sum / Math.max(codes.length, 1));

        const demandBoost = career.localDemand ? career.localDemand * 2 : 0;

        return {
          career,
          score: baseScore + demandBoost,
        };
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

    // ============================================================
    // PAGE DE GARDE / EN-TETE
    // ============================================================

    doc.rect(0, 0, doc.page.width, 8).fill(this.pdfColors.blue);

    doc.y = 70;

    this.writeTitle(
      doc,
      "Rapport d'orientation",
      `Profil RIASEC  •  Généré le ${new Date(mapData.generatedAt).toLocaleDateString(
        'fr-FR',
      )}  •  Assessment ${mapData.assessment.id}`,
    );

    this.writeProfileHero(doc, mapData);

    this.writeInfoCards(doc, [
      {
        label: 'Code général',
        value: mapData.generalCode ?? 'N/A',
      },
      {
        label: 'Code spécifique',
        value: mapData.specificCode ?? 'N/A',
      },
      {
        label: 'Force du profil',
        value: mapData.profileStrengthLabel,
        accent: this.pdfColors.green,
      },
      {
        label: 'Cohérence',
        value: mapData.consistencyLabel,
        accent: this.pdfColors.orange,
      },
    ]);

    // ============================================================
    // 1. SYNTHESE DU PROFIL
    // ============================================================

    this.writeSection(doc, 'Synthese du profil', '01');

    this.writeKeyValue(doc, 'Type de test', this.formatEnum(mapData.assessment.type));

    this.writeKeyValue(doc, 'Progression', `${mapData.assessment.completionPercentage}%`);

    const topProfile = mapData.riasecSummary[0];

    if (topProfile) {
      doc.moveDown(0.5);

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

      this.writeParagraph(doc, `Profils complementaires : ${complements}.`);
    }

    // ============================================================
    // 2. SCORES RIASEC GLOBAUX
    // ============================================================

    this.writeSection(doc, 'Scores RIASEC globaux', '02');

    this.writeScoreTable(doc, mapData.riasecSummary);

    // ============================================================
    // 3. DETAIL PAR SECTION
    // ============================================================

    if (mapData.sectionSummary.length > 0) {
      this.writeSection(doc, 'Detail par section', '03');

      for (const section of mapData.sectionSummary) {
        this.writeSectionSubtitle(doc, section.label, section.topCodes);

        this.writeScoreTable(
          doc,
          section.scores.map((score) => ({
            ...score,
            label: riasecLabels[score.code],
          })),
        );

        doc.moveDown(0.4);
      }
    }

    // ============================================================
    // 4. RECOMMANDATIONS METIERS
    // ============================================================

    this.writeSection(doc, 'Recommandations metiers', '04');

    if (mapData.recommendations.length === 0) {
      this.writeParagraph(doc, 'Aucune recommandation metier disponible pour ce resultat.');
    }

    for (const rec of mapData.recommendations) {
      this.writeRecommendationCard(doc, rec);
    }

    // ============================================================
    // 5. PROCHAINES ACTIONS
    // ============================================================

    this.writeSection(doc, 'Prochaines actions', '05');

    this.writeNextSteps(doc, mapData.nextSteps);

    // ============================================================
    // PIED DE PAGE
    // ============================================================

    const pageRange = doc.bufferedPageRange();

    for (let i = pageRange.start; i < pageRange.start + pageRange.count; i++) {
      doc.switchToPage(i);

      const pageNumber = i + 1;

      const footerY = doc.page.height - 30;

      // FIX PAGES BLANCHES (cause reelle) : footerY se trouve au-dela de la zone
      // de marge basse habituelle (doc.page.height - doc.page.margins.bottom).
      // PDFKit ajoute automatiquement une NOUVELLE page des qu'un .text() est
      // ecrit au-dela de cette limite, meme avec un y explicite fourni. Chaque
      // ligne de footer (x2 par page) declenchait donc l'ajout d'une page vide
      // supplementaire. On neutralise temporairement la marge basse le temps
      // d'ecrire le footer, puis on la restaure.
      const originalBottomMargin = doc.page.margins.bottom;

      doc.page.margins.bottom = 0;

      doc
        .moveTo(doc.page.margins.left, footerY - 8)
        .lineTo(doc.page.width - doc.page.margins.right, footerY - 8)
        .strokeColor(this.pdfColors.border)
        .lineWidth(0.5)
        .stroke();

      doc
        .fontSize(7.5)
        .font('Helvetica')
        .fillColor(this.pdfColors.textMuted)
        .text("Rapport d'orientation RIASEC", doc.page.margins.left, footerY);

      doc.text(
        `Document confidentiel  •  Page ${pageNumber} / ${pageRange.count}`,
        doc.page.margins.left,
        footerY,
        {
          width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
          align: 'right',
        },
      );

      doc.page.margins.bottom = originalBottomMargin;
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
      where: {
        sessionToken: sessionToken,
      },
      select: {
        id: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Session introuvable');
    }

    const assessment = assessmentId
      ? await this.prisma.assessment.findFirst({
          where: {
            id: assessmentId,
            sessionId: session.id,
          },
        })
      : await this.prisma.assessment.findFirst({
          where: {
            sessionId: session.id,
            status: TestStatus.COMPLETED,
          },
          orderBy: {
            completedAt: 'desc',
          },
        });

    if (!assessment) {
      throw new NotFoundException('Aucun test disponible pour cette session');
    }

    let result = await this.prisma.assessmentResult.findUnique({
      where: {
        assessmentId: assessment.id,
      },
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
      where: {
        resultId: result.id,
      },
      include: {
        career: true,
      },
      orderBy: {
        rankPosition: 'asc',
      },
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
      where: {
        id: {
          in: recommendedCareerIds,
        },
      },
      include: {
        institutions: {
          orderBy: [
            {
              isPrimary: 'desc',
            },
            {
              createdAt: 'asc',
            },
          ],
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
                    if (!scholarship.isActive) {
                      return false;
                    }

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
      ...(generatePdf
        ? {
            pdfUrl,
          }
        : {}),
    };

    const treasureMap = await this.prisma.treasureMap.upsert({
      where: {
        assessmentId: assessment.id,
      },

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
      where: {
        shareToken: shareToken,
      },
    });

    if (!map) {
      throw new NotFoundException('Carte introuvable');
    }

    await this.prisma.treasureMap.update({
      where: {
        id: map.id,
      },

      data: {
        viewCount: {
          increment: 1,
        },

        lastViewedAt: new Date(),
      },
    });

    return map;
  }

  async getBySessionToken(sessionToken: string) {
    const session = await this.prisma.session.findUnique({
      where: {
        sessionToken,
      },
      select: {
        id: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Session introuvable');
    }

    const map = await this.prisma.treasureMap.findFirst({
      where: {
        assessment: {
          sessionId: session.id,
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!map) {
      throw new NotFoundException('Carte introuvable');
    }

    return map;
  }
}
