import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TestStatus, TestType } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import type {
  AssessmentDetailDto,
  AssessmentRecommendationsDto,
  AssessmentSummaryDto,
  BehaviorMetricsDto,
  UserHistoryDto,
} from '@modules/users/dto';

@Injectable()
export class UserHistoryService {
  private readonly logger = new Logger(UserHistoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // Endpoint 1 : Vue globale (liste des sessions + assessments résumés)
  // GET /api/v1/users/me/history
  // ─────────────────────────────────────────────────────────────────────────

  async getHistory(userId: string): Promise<UserHistoryDto> {
    // 1. Récupérer le profil utilisateur avec toutes les sessions et leurs tests
    // NB: la relation User → Session s'appelle "authSessions" dans le schéma Prisma
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        bio: true,
        createdAt: true,
        authSessions: {
          orderBy: { createdAt: 'desc' as const },
          select: {
            id: true,
            sessionToken: true,
            shareToken: true, // String? (nullable dans le schéma)
            totalXp: true,
            level: true,
            createdAt: true,
            badges: {
              orderBy: { unlockedAt: 'desc' as const },
              select: {
                unlockedAt: true,
                badge: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                    description: true,
                    emoji: true,
                    rarity: true,
                    pointsValue: true,
                  },
                },
              },
            },
            assessments: {
              orderBy: { startedAt: 'desc' as const },
              select: {
                id: true,
                type: true,
                status: true,
                completionPercentage: true,
                startedAt: true,
                completedAt: true,
                result: {
                  select: {
                    riasecCode: true,
                    consistencyLevel: true,
                  },
                },
                treasureMap: {
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // 2. Calculer les totaux globaux
    const allAssessments = user.authSessions.flatMap((s) => s.assessments);
    const totalAssessments = allAssessments.length;
    const completedAssessments = allAssessments.filter(
      (a) => a.status === TestStatus.COMPLETED,
    ).length;

    // 3. Consolider les badges de toutes les sessions (dédupliqués par code)
    const seenBadgeCodes = new Set<string>();
    const allBadges = user.authSessions
      .flatMap((s) => s.badges)
      .filter((sb) => {
        if (seenBadgeCodes.has(sb.badge.code)) return false;
        seenBadgeCodes.add(sb.badge.code);
        return true;
      })
      .map((sb) => ({
        id: sb.badge.id,
        code: sb.badge.code,
        name: sb.badge.name,
        description: sb.badge.description,
        emoji: sb.badge.emoji ?? '',
        rarity: sb.badge.rarity,
        pointsValue: sb.badge.pointsValue,
        unlockedAt: sb.unlockedAt,
      }));

    // 4. Agréger XP & niveau (dernière session créée = référence)
    const latestSession = user.authSessions[0];
    const gamification = {
      totalXp: latestSession?.totalXp ?? 0,
      level: latestSession?.level ?? 1,
    };

    // 5. Mapper les sessions avec leurs assessments résumés
    const sessions = user.authSessions.map((session) => ({
      id: session.id,
      sessionToken: session.sessionToken,
      shareToken: session.shareToken ?? '', // shareToken est nullable
      createdAt: session.createdAt,
      assessments: session.assessments.map(
        (a): AssessmentSummaryDto => ({
          id: a.id,
          type: a.type,
          status: a.status,
          completionPercentage: a.completionPercentage,
          generalCode: a.result?.riasecCode ?? null,
          specificCode: a.result?.riasecCode ?? null,
          consistencyLevel: a.result?.consistencyLevel ?? null,
          hasResult: a.result !== null,
          hasTreasureMap: a.treasureMap !== null,
          startedAt: a.startedAt,
          completedAt: a.completedAt,
        }),
      ),
    }));

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      bio: user.bio,
      createdAt: user.createdAt,
      gamification,
      badges: allBadges,
      sessions,
      totalAssessments,
      completedAssessments,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Endpoint 2 : Détail d'un test spécifique
  // GET /api/v1/users/me/assessments/:assessmentId
  // ─────────────────────────────────────────────────────────────────────────

  async getAssessmentDetail(userId: string, assessmentId: string): Promise<AssessmentDetailDto> {
    // Vérifier que le test appartient à une session de cet utilisateur
    const assessment = await this.prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        session: { userId },
      },
      include: {
        result: true,
        treasureMap: true,
      },
    });

    if (!assessment) {
      throw new NotFoundException('Test introuvable ou accès non autorisé');
    }

    // Métriques comportementales : calculer depuis les réponses
    const behaviorMetrics = await this.computeBehaviorMetrics(
      assessmentId,
      assessment.currentCategory,
    );

    // Mapper le résultat si présent
    const result = assessment.result
      ? {
          id: assessment.result.id,
          generalCode: assessment.result.riasecCode,
          specificCode: assessment.result.riasecCode,
          strengths: assessment.result.strengths,
          consistencyLevel: assessment.result.consistencyLevel,
          consistencyScore: assessment.result.consistencyScore,
          profileStrength: assessment.result.profileStrength,
          differentiationScore: assessment.result.differentiationScore,
          generalScores: this.getScoreSection(assessment.result.scoresByCategory, 'GENERALE'),
          specificScores: this.getScoreSection(assessment.result.scoresByCategory, 'totalRaw'),
          sectionScores: this.asRecord(assessment.result.scoresByCategory),
          subjectiveRanking: assessment.result.subjectiveRanking,
          createdAt: assessment.result.createdAt,
        }
      : null;

    // Mapper la carte au trésor si présente
    const treasureMap = assessment.treasureMap
      ? {
          id: assessment.treasureMap.id,
          shareToken: assessment.treasureMap.shareToken,
          pdfUrl: assessment.treasureMap.pdfUrl,
          viewCount: assessment.treasureMap.viewCount,
          downloadCount: assessment.treasureMap.downloadCount,
          lastViewedAt: assessment.treasureMap.lastViewedAt,
          createdAt: assessment.treasureMap.createdAt,
        }
      : null;

    return {
      id: assessment.id,
      type: assessment.type,
      status: assessment.status,
      completionPercentage: assessment.completionPercentage,
      startedAt: assessment.startedAt,
      completedAt: assessment.completedAt,
      result,
      behaviorMetrics,
      treasureMap,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Endpoint 3 : Recommandations (métiers + formations + bourses)
  // GET /api/v1/users/me/assessments/:assessmentId/recommendations
  // ─────────────────────────────────────────────────────────────────────────

  async getAssessmentRecommendations(
    userId: string,
    assessmentId: string,
    limit = 6,
  ): Promise<AssessmentRecommendationsDto> {
    // Vérifier que le test appartient à cet utilisateur et est terminé
    const assessment = await this.prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        session: { userId },
      },
      include: {
        result: {
          include: {
            careerRecommendations: {
              orderBy: { rankPosition: 'asc' },
              take: Math.min(limit, 20),
              include: {
                career: {
                  include: {
                    institutions: {
                      include: {
                        formation: {
                          include: {
                            university: {
                              select: {
                                id: true,
                                name: true,
                                city: true,
                                address: true,
                                website: true,
                                latitude: true,
                                longitude: true,
                              },
                            },
                          },
                        },
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

    if (!assessment) {
      throw new NotFoundException('Test introuvable ou accès non autorisé');
    }

    if (assessment.status !== TestStatus.COMPLETED) {
      throw new ForbiddenException(
        "Les recommandations ne sont disponibles qu'après la complétion du test",
      );
    }

    if (!assessment.result) {
      return {
        assessmentId,
        riasecCode: null,
        careers: [],
        formations: [],
        totalCareers: 0,
        totalFormations: 0,
      };
    }

    const result = assessment.result;
    const riasecCode = result.riasecCode ?? null;

    // Construire la liste des recommandations de métiers
    const careerRecs = result.careerRecommendations.map((rec) => ({
      id: rec.id,
      rankPosition: rec.rankPosition,
      matchScore: rec.matchScore,
      viewed: rec.viewedAt !== null,
      savedForLater: rec.savedForLater,
      viewedAt: rec.viewedAt,
      career: {
        id: rec.career.id,
        name: rec.career.name,
        summary: rec.career.summary,
        description: rec.career.description,
        category: rec.career.category,
        riasecCodes: rec.career.riasecCodes,
        localDemand: rec.career.localDemand,
        formationLevel: rec.career.formationLevel,
        salaryRangeMin: rec.career.salaryRangeMin,
        salaryRangeMax: rec.career.salaryRangeMax,
        imageUrl: rec.career.imageUrl,
        videoUrl: rec.career.videoUrl,
        tags: rec.career.tags,
      },
    }));

    // Construire la liste des formations à partir des carrières recommandées
    const formationMap = new Map<
      number,
      {
        formation: {
          id: number;
          title: string;
          degree: string;
          duration: string;
          field?: string | null;
          costMin?: number | null;
          costMax?: number | null;
        };
        university: {
          id: number;
          name: string;
          city?: string | null;
          address?: string | null;
          website: string;
          latitude?: number | null;
          longitude?: number | null;
        };
        score: number;
        scholarships: Array<{
          id: number;
          code?: string | null;
          title: string;
          provider: string;
          amountLabel?: string | null;
          applicationUrl?: string | null;
          applicationCloseAt?: Date | null;
          fundingType?: string | null;
          matchReason: string[];
        }>;
      }
    >();

    for (const rec of result.careerRecommendations) {
      for (const link of rec.career.institutions) {
        const formation = link.formation;
        if (!formation || !formation.university || formation.universityId === null) continue;
        if (formationMap.has(formation.id)) continue;

        formationMap.set(formation.id, {
          formation: {
            id: formation.id,
            title: formation.title,
            degree: formation.degree,
            duration: formation.duration,
            field: formation.field,
            costMin: formation.costMin,
            costMax: formation.costMax,
          },
          university: {
            id: formation.university.id,
            name: formation.university.name,
            city: formation.university.city,
            address: formation.university.address,
            website: formation.university.website,
            latitude: formation.university.latitude,
            longitude: formation.university.longitude,
          },
          score: rec.matchScore,
          scholarships: [],
        });
      }
    }

    // Charger les bourses applicables pour les formations identifiées
    const formationEntries = Array.from(formationMap.values());
    if (formationEntries.length > 0) {
      const universityIds = [...new Set(formationEntries.map((f) => f.university.id))];
      const now = new Date();
      const scholarships = await this.prisma.scholarship.findMany({
        where: {
          isActive: true,
          status: 'PUBLISHED',
          OR: [
            { universities: { some: { universityId: { in: universityIds } } } },
            { universities: { none: {} } },
          ],
          AND: [
            {
              OR: [{ applicationCloseAt: null }, { applicationCloseAt: { gte: now } }],
            },
          ],
        },
        include: { universities: true },
        orderBy: [{ applicationCloseAt: 'asc' }, { createdAt: 'desc' }],
        take: 200,
      });

      for (const entry of formationEntries) {
        const matched = scholarships
          .filter((s) => {
            const linkedIds = s.universities.map((u) => u.universityId);
            return linkedIds.length === 0 || linkedIds.includes(entry.university.id);
          })
          .slice(0, 5)
          .map((s) => ({
            id: s.id,
            code: s.code,
            title: s.title,
            provider: s.provider,
            amountLabel: s.amountLabel,
            applicationUrl: s.applicationUrl,
            applicationCloseAt: s.applicationCloseAt,
            fundingType: s.fundingType,
            matchReason: s.universities.some((u) => u.universityId === entry.university.id)
              ? ['Liée à la même université']
              : ['Bourse ouverte (non liée à une université spécifique)'],
          }));

        entry.scholarships = matched;
      }
    }

    const formations = formationEntries.slice(0, 20);

    return {
      assessmentId,
      riasecCode,
      careers: careerRecs,
      formations,
      totalCareers: careerRecs.length,
      totalFormations: formations.length,
    };
  }

  async addScholarshipToUser(userId: string, scholarshipId: number) {
    return this.prisma.scholarshipUser.create({
      data: { userId, scholarshipId },
      include: { user: true, scholarship: true },
    });
  }

  async getScholarshipFromUser(userId: string, scholarshipId?: number) {
    return this.prisma.scholarshipUser.findMany({
      where: {
        userId,
        ...(scholarshipId ? { scholarshipId } : {}),
      },
    });
  }

  async removeScholarshipFromUser(userId: string, scholarshipId: number) {
    return this.prisma.scholarshipUser.delete({
      where: {
        userId_scholarshipId: {
          userId,
          scholarshipId,
        },
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Méthodes privées utilitaires
  // ─────────────────────────────────────────────────────────────────────────

  private async computeBehaviorMetrics(
    assessmentId: string,
    category: TestType | null,
  ): Promise<BehaviorMetricsDto> {
    const responses = await this.prisma.response.findMany({
      where: {
        assessmentId,
        responseTimeMs: { not: null },
        ...(category ? { question: { category } } : {}),
      },
      select: { responseTimeMs: true },
    });

    const times = responses
      .map((r) => r.responseTimeMs ?? 0)
      .filter((v) => Number.isFinite(v) && v > 0);

    if (!times.length) {
      return {
        responseCount: 0,
        avgResponseTimeMs: null,
        responseVarianceMs: null,
        dominantPattern: null,
      };
    }

    const avg = times.reduce((sum, v) => sum + v, 0) / times.length;
    const variance = times.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / times.length;

    // Détermination du profil comportemental dominant
    const fastResponses = times.filter((t) => t < 2000).length;
    const slowResponses = times.filter((t) => t > 15000).length;
    const fastRatio = fastResponses / times.length;
    const slowRatio = slowResponses / times.length;

    let dominantPattern: string | null = null;
    if (fastRatio > 0.6) {
      dominantPattern = 'Spontané';
    } else if (slowRatio > 0.4) {
      dominantPattern = 'Réfléchi';
    } else if (variance < avg * 0.5) {
      dominantPattern = 'Méthodique';
    } else {
      dominantPattern = 'Mixte';
    }

    return {
      responseCount: times.length,
      avgResponseTimeMs: Math.round(avg),
      responseVarianceMs: Math.round(variance),
      dominantPattern,
    };
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  }

  private getScoreSection(value: unknown, key: string): Record<string, number> | null {
    const record = this.asRecord(value);
    const section = record ? this.asRecord(record[key]) : null;
    if (!section) return null;

    const scores: Record<string, number> = {};
    for (const [scoreKey, scoreValue] of Object.entries(section)) {
      if (typeof scoreValue === 'number') {
        scores[scoreKey] = scoreValue;
      }
    }
    return scores;
  }
}
