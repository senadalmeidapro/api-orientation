import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ResultsService } from './results.service';
import { AssessmentStatus, AssessmentType, Phase2Type, RiasecType, Prisma } from '@prisma/client';
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
    type: AssessmentType;
    status: AssessmentStatus;
    startedAt: string;
    completedAt: string | null;
    completionPercentage: number;
  };
  phase1Code: string | null;
  phase2Code: string | null;
  dominantCode: string | null;
  riasecSummary: Array<{
    code: RiasecType;
    label: string;
    score: number;
    rank: number;
  }>;
  phase1Scores: Prisma.JsonValue | null;
  phase2Scores: Prisma.JsonValue | null;
  sectionScores: Prisma.JsonValue | null;
  sectionSummary: Array<{
    section: Phase2Type;
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

const sectionLabels: Record<Phase2Type, string> = {
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

  private buildWeights(phase2Code: string) {
    const letters = phase2Code.split('') as RiasecType[];
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

    return (Object.keys(sectionLabels) as Phase2Type[])
      .map((section) => {
        const scores = this.sortScores(this.extractScores(normalized[section])).map(
          ({ code, score, rank }) => ({ code, score, rank }),
        );
        return {
          section,
          label: sectionLabels[section],
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
        'Reprendre les resultats avec un conseiller: vos reponses montrent une coherence faible entre les phases.',
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
    doc.fontSize(21).fillColor('#111827').text(title, { align: 'center' });
    if (subtitle) {
      doc.moveDown(0.35);
      doc.fontSize(10).fillColor('#4b5563').text(subtitle, { align: 'center' });
    }
    doc.moveDown(1.2);
  }

  private writeSection(doc: PDFKit.PDFDocument, title: string) {
    if (doc.y > 690) doc.addPage();
    doc.moveDown(0.6);
    doc.fontSize(14).fillColor('#111827').text(title, { underline: true });
    doc.moveDown(0.35);
  }

  private writeKeyValue(doc: PDFKit.PDFDocument, label: string, value: string | number | null) {
    const text = value === null || value === undefined || value === '' ? 'Non disponible' : value;
    doc
      .fontSize(10)
      .fillColor('#374151')
      .text(`${label}: `, { continued: true })
      .fillColor('#111827')
      .text(String(text));
  }

  private writeParagraph(doc: PDFKit.PDFDocument, text: string) {
    if (doc.y > 710) doc.addPage();
    doc.fontSize(10).fillColor('#374151').text(text, {
      align: 'left',
      lineGap: 3,
    });
  }

  private writeBullet(doc: PDFKit.PDFDocument, text: string, indent = 12) {
    if (doc.y > 720) doc.addPage();
    doc.fontSize(9.5).fillColor('#374151').text(`- ${text}`, { indent, lineGap: 2 });
  }

  private writeScoreTable(
    doc: PDFKit.PDFDocument,
    scores: Array<{ code: RiasecType; label?: string; score: number; rank: number }>,
  ) {
    const tableTop = doc.y;
    const xCode = 55;
    const xLabel = 95;
    const xScore = 235;
    const xBar = 300;
    const maxScore = Math.max(...scores.map((item) => item.score), 100);

    doc.fontSize(9).fillColor('#111827');
    doc.text('Rang', xCode, tableTop);
    doc.text('Profil', xLabel, tableTop);
    doc.text('Score', xScore, tableTop);
    doc.text('Lecture', xBar, tableTop);
    doc.moveDown(0.5);

    for (const item of scores) {
      if (doc.y > 700) doc.addPage();
      const y = doc.y + 4;
      const width = Math.round((item.score / Math.max(maxScore, 1)) * 180);
      doc.fillColor('#374151').fontSize(9);
      doc.text(String(item.rank), xCode, y);
      doc.text(`${item.code} - ${item.label ?? riasecLabels[item.code]}`, xLabel, y);
      doc.text(String(item.score), xScore, y);
      doc.rect(xBar, y + 2, 180, 7).fill('#e5e7eb');
      doc.rect(xBar, y + 2, Math.max(width, item.score > 0 ? 4 : 0), 7).fill('#2563eb');
      doc.moveDown(0.85);
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
    this.writeKeyValue(doc, 'Code phase 1', mapData.phase1Code);
    this.writeKeyValue(doc, 'Code phase 2', mapData.phase2Code);
    this.writeKeyValue(doc, 'Force du profil', mapData.profileStrengthLabel);
    this.writeKeyValue(doc, 'Coherence phase 1 / phase 2', mapData.consistencyLabel);
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
        if (doc.y > 670) doc.addPage();
        doc
          .fontSize(11)
          .fillColor('#111827')
          .text(`${section.label} - code ${section.topCodes || 'N/A'}`);
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
      if (doc.y > 620) doc.addPage();
      doc
        .fontSize(12)
        .fillColor('#111827')
        .text(`${rec.rankPosition}. ${rec.career.name} - ${rec.matchScore}% d adequation`);
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
        doc.moveDown(0.25);
        doc.fontSize(10).fillColor('#111827').text('Formations associees');
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
      doc
        .fontSize(8)
        .fillColor('#6b7280')
        .text(`Page ${i + 1} / ${pageRange.count}`, 48, 805, { align: 'center' });
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
      result.phase2Scores &&
      this.sortScores(this.extractScores(result.phase2Scores)).some((s) => s.score > 0)
        ? this.extractScores(result.phase2Scores)
        : this.extractScores(result.phase1Scores);
    const riasecSummary = this.sortScores(baseScores);
    const dominantCode =
      result.phase2Code ??
      result.phase1Code ??
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
      phase1Code: result.phase1Code,
      phase2Code: result.phase2Code,
      dominantCode: dominantCode || null,
      riasecSummary,
      phase1Scores: result.phase1Scores,
      phase2Scores: result.phase2Scores,
      sectionScores: result.sectionScores,
      sectionSummary: this.buildSectionSummary(result.sectionScores),
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
                    if (scholarship.applicationCloseAt && scholarship.applicationCloseAt < now) {
                      return false;
                    }
                    return true;
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
