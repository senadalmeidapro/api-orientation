import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AssessmentStatus, Prisma, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardSummaryDto } from './dto/dashboard-summary.dto';
import {
  AdminAssessmentsFilterDto,
  AdminPhase1QuestionsFilterDto,
  AdminPhase2QuestionsFilterDto,
  AdminSessionsFilterDto,
  AdminUsersFilterDto,
} from './dto/admin-filters.dto';
import {
  CreatePhase1QuestionAdminDto,
  CreatePhase2QuestionAdminDto,
  UpdatePhase1QuestionAdminDto,
  UpdatePhase2QuestionAdminDto,
} from './dto/manage-questions.dto';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { AdminPaginationDto } from './dto/admin-pagination.dto';

@Injectable()
export class BackofficeService {
  constructor(private readonly prisma: PrismaService) {}

  private toPagination(page = 1, pageSize = 20) {
    const take = Math.max(1, Math.min(pageSize, 100));
    const currentPage = Math.max(1, page);
    const skip = (currentPage - 1) * take;
    return { take, skip, currentPage };
  }

  private parsePeriod(dto?: DashboardQueryDto) {
    const from = dto?.from ? new Date(dto.from) : null;
    const to = dto?.to ? new Date(dto.to) : null;

    if (from && Number.isNaN(from.getTime())) throw new BadRequestException('Date from invalide');
    if (to && Number.isNaN(to.getTime())) throw new BadRequestException('Date to invalide');
    if (from && to && from > to) throw new BadRequestException('from doit être <= to');

    const range = {
      ...(from ? { gte: from } : {}),
      ...(to ? { lte: to } : {}),
    };
    return {
      from,
      to,
      hasRange: Object.keys(range).length > 0,
      range,
    };
  }

  async getDashboardSummary(query?: DashboardQueryDto): Promise<DashboardSummaryDto> {
    const period = this.parsePeriod(query);
    const now = new Date();

    const [
      users,
      sessions,
      assessments,
      careers,
      resources,
      universities,
      testVersions,
      languages,
      phase1Questions,
      phase2Questions,
      phase1Responses,
      phase2Responses,
      assessmentResults,
      recommendations,
      treasureMaps,
      formations,
      scholarships,
      badges,
      sessionBadges,
      xpHistory,
      feedbacks,
      outcomes,
      interactions,
      usersAdmin,
      usersAgent,
      usersStandard,
      usersActive,
      usersPending,
      usersSuspended,
      usersDeleted,
      assessmentsInProgress,
      assessmentsCompleted,
      assessmentsAbandoned,
      sessionsActive,
      sessionsInactive,
      sessionsCurrent,
      sessionsExpired,
      resourcesPublished,
      resourcesDraft,
      careersActive,
      careersInactive,
      universitiesActive,
      universitiesInactive,
      formationsActive,
      formationsInactive,
      scholarshipsActive,
      scholarshipsInactive,
      phase1QuestionsActive,
      phase1QuestionsInactive,
      phase2QuestionsActive,
      phase2QuestionsInactive,
      recommendationsViewed,
      recommendationsNotViewed,
      recommendationsSavedForLater,
      treasureMapsViewed,
      treasureMapsNotViewed,
      treasureMapsDownloaded,
      pUsers,
      pSessions,
      pAssessments,
      pPhase1Responses,
      pPhase2Responses,
      pAssessmentResults,
      pRecommendations,
      pResources,
      pUniversities,
      pFormations,
      pScholarships,
      pSessionBadges,
      pXpHistory,
      pFeedbacks,
      pOutcomes,
      pInteractions,
    ] = await this.prisma.$transaction([
      this.prisma.user.count({ where: { isDeleted: false } }),
      this.prisma.session.count(),
      this.prisma.assessment.count(),
      this.prisma.career.count(),
      this.prisma.resource.count(),
      this.prisma.university.count(),
      this.prisma.testVersion.count(),
      this.prisma.language.count(),
      this.prisma.phase1Question.count(),
      this.prisma.phase2Question.count(),
      this.prisma.phase1Response.count(),
      this.prisma.phase2Response.count(),
      this.prisma.assessmentResult.count(),
      this.prisma.assessmentCareerRecommendation.count(),
      this.prisma.treasureMap.count(),
      this.prisma.formation.count(),
      this.prisma.scholarship.count(),
      this.prisma.badge.count(),
      this.prisma.sessionBadge.count(),
      this.prisma.xPHistory.count(),
      this.prisma.assessmentFeedback.count(),
      this.prisma.assessmentOutcome.count(),
      this.prisma.assessmentInteraction.count(),
      this.prisma.user.count({ where: { role: UserRole.ADMIN, isDeleted: false } }),
      this.prisma.user.count({ where: { role: UserRole.AGENT, isDeleted: false } }),
      this.prisma.user.count({ where: { role: UserRole.USER, isDeleted: false } }),
      this.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      this.prisma.user.count({ where: { status: UserStatus.PENDING } }),
      this.prisma.user.count({ where: { status: UserStatus.SUSPENDED } }),
      this.prisma.user.count({ where: { status: UserStatus.DELETED } }),
      this.prisma.assessment.count({ where: { status: AssessmentStatus.IN_PROGRESS } }),
      this.prisma.assessment.count({ where: { status: AssessmentStatus.COMPLETED } }),
      this.prisma.assessment.count({ where: { status: AssessmentStatus.ABANDONED } }),
      this.prisma.session.count({ where: { isActive: true } }),
      this.prisma.session.count({ where: { isActive: false } }),
      this.prisma.session.count({ where: { isCurrent: true } }),
      this.prisma.session.count({ where: { expiresAt: { lt: now } } }),
      this.prisma.resource.count({ where: { isPublished: true } }),
      this.prisma.resource.count({ where: { isPublished: false } }),
      this.prisma.career.count({ where: { isActive: true } }),
      this.prisma.career.count({ where: { isActive: false } }),
      this.prisma.university.count({ where: { isActive: true } }),
      this.prisma.university.count({ where: { isActive: false } }),
      this.prisma.formation.count({ where: { isActive: true } }),
      this.prisma.formation.count({ where: { isActive: false } }),
      this.prisma.scholarship.count({ where: { isActive: true } }),
      this.prisma.scholarship.count({ where: { isActive: false } }),
      this.prisma.phase1Question.count({ where: { isActive: true } }),
      this.prisma.phase1Question.count({ where: { isActive: false } }),
      this.prisma.phase2Question.count({ where: { isActive: true } }),
      this.prisma.phase2Question.count({ where: { isActive: false } }),
      this.prisma.assessmentCareerRecommendation.count({ where: { viewedAt: { not: null } } }),
      this.prisma.assessmentCareerRecommendation.count({ where: { viewedAt: null } }),
      this.prisma.assessmentCareerRecommendation.count({ where: { savedForLater: true } }),
      this.prisma.treasureMap.count({ where: { viewCount: { gt: 0 } } }),
      this.prisma.treasureMap.count({ where: { viewCount: 0 } }),
      this.prisma.treasureMap.count({ where: { downloadCount: { gt: 0 } } }),
      this.prisma.user.count({ where: period.hasRange ? { createdAt: period.range } : {} }),
      this.prisma.session.count({ where: period.hasRange ? { createdAt: period.range } : {} }),
      this.prisma.assessment.count({ where: period.hasRange ? { startedAt: period.range } : {} }),
      this.prisma.phase1Response.count({
        where: period.hasRange ? { createdAt: period.range } : {},
      }),
      this.prisma.phase2Response.count({
        where: period.hasRange ? { createdAt: period.range } : {},
      }),
      this.prisma.assessmentResult.count({
        where: period.hasRange ? { createdAt: period.range } : {},
      }),
      this.prisma.assessmentCareerRecommendation.count({
        where: period.hasRange ? { createdAt: period.range } : {},
      }),
      this.prisma.resource.count({ where: period.hasRange ? { createdAt: period.range } : {} }),
      this.prisma.university.count({ where: period.hasRange ? { createdAt: period.range } : {} }),
      this.prisma.formation.count({ where: period.hasRange ? { createdAt: period.range } : {} }),
      this.prisma.scholarship.count({ where: period.hasRange ? { createdAt: period.range } : {} }),
      this.prisma.sessionBadge.count({
        where: period.hasRange ? { unlockedAt: period.range } : {},
      }),
      this.prisma.xPHistory.count({ where: period.hasRange ? { createdAt: period.range } : {} }),
      this.prisma.assessmentFeedback.count({
        where: period.hasRange ? { createdAt: period.range } : {},
      }),
      this.prisma.assessmentOutcome.count({
        where: period.hasRange ? { createdAt: period.range } : {},
      }),
      this.prisma.assessmentInteraction.count({
        where: period.hasRange ? { createdAt: period.range } : {},
      }),
    ]);

    return {
      totals: { users, sessions, assessments, careers, resources, universities },
      totalsExtended: {
        testVersions,
        languages,
        phase1Questions,
        phase2Questions,
        phase1Responses,
        phase2Responses,
        assessmentResults,
        recommendations,
        treasureMaps,
        formations,
        scholarships,
        badges,
        sessionBadges,
        xpHistory,
        feedbacks,
        outcomes,
        interactions,
      },
      usersByRole: { ADMIN: usersAdmin, AGENT: usersAgent, USER: usersStandard },
      usersByStatus: {
        ACTIVE: usersActive,
        PENDING: usersPending,
        SUSPENDED: usersSuspended,
        DELETED: usersDeleted,
      },
      assessmentsByStatus: {
        IN_PROGRESS: assessmentsInProgress,
        COMPLETED: assessmentsCompleted,
        ABANDONED: assessmentsAbandoned,
      },
      sessionsByState: {
        active: sessionsActive,
        inactive: sessionsInactive,
        current: sessionsCurrent,
        expired: sessionsExpired,
      },
      publicationStats: {
        resourcesPublished,
        resourcesDraft,
      },
      activationStats: {
        careersActive,
        careersInactive,
        universitiesActive,
        universitiesInactive,
        formationsActive,
        formationsInactive,
        scholarshipsActive,
        scholarshipsInactive,
        phase1QuestionsActive,
        phase1QuestionsInactive,
        phase2QuestionsActive,
        phase2QuestionsInactive,
      },
      recommendationStats: {
        viewed: recommendationsViewed,
        notViewed: recommendationsNotViewed,
        savedForLater: recommendationsSavedForLater,
      },
      treasureMapStats: {
        viewed: treasureMapsViewed,
        notViewed: treasureMapsNotViewed,
        downloaded: treasureMapsDownloaded,
      },
      periodTotals: {
        users: pUsers,
        sessions: pSessions,
        assessments: pAssessments,
        phase1Responses: pPhase1Responses,
        phase2Responses: pPhase2Responses,
        assessmentResults: pAssessmentResults,
        recommendations: pRecommendations,
        resources: pResources,
        universities: pUniversities,
        formations: pFormations,
        scholarships: pScholarships,
        sessionBadges: pSessionBadges,
        xpHistory: pXpHistory,
        feedbacks: pFeedbacks,
        outcomes: pOutcomes,
        interactions: pInteractions,
      },
      periodFrom: period.from ? period.from.toISOString() : null,
      periodTo: period.to ? period.to.toISOString() : null,
    };
  }

  async listUsers(dto: AdminUsersFilterDto) {
    const { take, skip, currentPage } = this.toPagination(dto.page, dto.pageSize);
    const where: Prisma.UserWhereInput = {
      ...(dto.q
        ? {
            OR: [
              { email: { contains: dto.q, mode: 'insensitive' } },
              { firstName: { contains: dto.q, mode: 'insensitive' } },
              { lastName: { contains: dto.q, mode: 'insensitive' } },
              { displayName: { contains: dto.q, mode: 'insensitive' } },
            ],
          }
        : {}),

      ...(dto.role ? { role: dto.role } : {}),
      ...(dto.status ? { status: dto.status } : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    ]);

    return { page: currentPage, pageSize: take, total, data };
  }

  async listSessions(dto: AdminSessionsFilterDto) {
    const { take, skip, currentPage } = this.toPagination(dto.page, dto.pageSize);
    const where: Prisma.SessionWhereInput = {
      ...(dto.userId ? { userId: dto.userId } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      ...(dto.q
        ? {
            OR: [
              { sessionToken: { contains: dto.q, mode: 'insensitive' } },
              { shareToken: { contains: dto.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.session.count({ where }),
      this.prisma.session.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, displayName: true, role: true } },
          _count: { select: { assessments: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return { page: currentPage, pageSize: take, total, data };
  }

  async listAssessments(dto: AdminAssessmentsFilterDto) {
    const { take, skip, currentPage } = this.toPagination(dto.page, dto.pageSize);
    const where: Prisma.AssessmentWhereInput = {
      ...(dto.status ? { status: dto.status } : {}),
      ...(dto.type ? { type: dto.type } : {}),
      ...(dto.sessionId ? { sessionId: dto.sessionId } : {}),
      ...(dto.userId ? { session: { userId: dto.userId } } : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.assessment.count({ where }),
      this.prisma.assessment.findMany({
        where,
        include: {
          session: {
            select: {
              id: true,
              sessionToken: true,
              user: { select: { id: true, email: true, displayName: true } },
            },
          },
          _count: {
            select: {
              phase1Responses: true,
              phase2Responses: true,
              interactions: true,
              feedbacks: true,
            },
          },
        },
        orderBy: { startedAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return { page: currentPage, pageSize: take, total, data };
  }

  async listPhase1Questions(dto: AdminPhase1QuestionsFilterDto) {
    const { take, skip, currentPage } = this.toPagination(dto.page, dto.pageSize);
    const where: Prisma.Phase1QuestionWhereInput = {
      ...(dto.testVersionId ? { testVersionId: dto.testVersionId } : {}),
      ...(dto.riasecTypeId ? { riasecTypeId: dto.riasecTypeId } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      ...(dto.q ? { questionText: { contains: dto.q, mode: 'insensitive' } } : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.phase1Question.count({ where }),
      this.prisma.phase1Question.findMany({
        where,
        include: { testVersion: true, riasecType: true, _count: { select: { responses: true } } },
        orderBy: [{ testVersionId: 'asc' }, { displayOrder: 'asc' }],
        skip,
        take,
      }),
    ]);

    return { page: currentPage, pageSize: take, total, data };
  }

  async listPhase2Questions(dto: AdminPhase2QuestionsFilterDto) {
    const { take, skip, currentPage } = this.toPagination(dto.page, dto.pageSize);
    const where: Prisma.Phase2QuestionWhereInput = {
      ...(dto.testVersionId ? { testVersionId: dto.testVersionId } : {}),
      ...(dto.riasecTypeId ? { riasecTypeId: dto.riasecTypeId } : {}),
      ...(dto.phase2Type ? { phase2Type: dto.phase2Type } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      ...(dto.q ? { questionText: { contains: dto.q, mode: 'insensitive' } } : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.phase2Question.count({ where }),
      this.prisma.phase2Question.findMany({
        where,
        include: { testVersion: true, riasecType: true, _count: { select: { responses: true } } },
        orderBy: [{ testVersionId: 'asc' }, { phase2Type: 'asc' }, { displayOrder: 'asc' }],
        skip,
        take,
      }),
    ]);

    return { page: currentPage, pageSize: take, total, data };
  }

  async createPhase1Question(dto: CreatePhase1QuestionAdminDto) {
    const displayOrder =
      dto.displayOrder ??
      ((
        await this.prisma.phase1Question.aggregate({
          where: { testVersionId: dto.testVersionId },
          _max: { displayOrder: true },
        })
      )._max.displayOrder ?? 0) + 1;

    return this.prisma.phase1Question.create({
      data: {
        riasecTypeId: dto.riasecTypeId,
        testVersionId: dto.testVersionId,
        questionText: dto.questionText,
        ...(dto.questionShort !== undefined ? { questionShort: dto.questionShort } : {}),
        displayOrder,
        pointsValue: dto.pointsValue ?? 10,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updatePhase1Question(id: number, dto: UpdatePhase1QuestionAdminDto) {
    const existing = await this.prisma.phase1Question.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Question phase 1 introuvable');

    return this.prisma.phase1Question.update({
      where: { id },
      data: {
        ...(dto.riasecTypeId ? { riasecTypeId: dto.riasecTypeId } : {}),
        ...(dto.questionText !== undefined ? { questionText: dto.questionText } : {}),
        ...(dto.questionShort !== undefined ? { questionShort: dto.questionShort } : {}),
        ...(dto.displayOrder !== undefined ? { displayOrder: dto.displayOrder } : {}),
        ...(dto.pointsValue !== undefined ? { pointsValue: dto.pointsValue } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async createPhase2Question(dto: CreatePhase2QuestionAdminDto) {
    const displayOrder =
      dto.displayOrder ??
      ((
        await this.prisma.phase2Question.aggregate({
          where: { testVersionId: dto.testVersionId, phase2Type: dto.phase2Type },
          _max: { displayOrder: true },
        })
      )._max.displayOrder ?? 0) + 1;

    return this.prisma.phase2Question.create({
      data: {
        riasecTypeId: dto.riasecTypeId,
        testVersionId: dto.testVersionId,
        phase2Type: dto.phase2Type,
        questionText: dto.questionText,
        ...(dto.questionSubtext !== undefined ? { questionSubtext: dto.questionSubtext } : {}),
        displayOrder,
        pointsValue: dto.pointsValue ?? 15,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updatePhase2Question(id: number, dto: UpdatePhase2QuestionAdminDto) {
    const existing = await this.prisma.phase2Question.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Question phase 2 introuvable');

    return this.prisma.phase2Question.update({
      where: { id },
      data: {
        ...(dto.riasecTypeId ? { riasecTypeId: dto.riasecTypeId } : {}),
        ...(dto.phase2Type ? { phase2Type: dto.phase2Type } : {}),
        ...(dto.questionText !== undefined ? { questionText: dto.questionText } : {}),
        ...(dto.questionSubtext !== undefined ? { questionSubtext: dto.questionSubtext } : {}),
        ...(dto.displayOrder !== undefined ? { displayOrder: dto.displayOrder } : {}),
        ...(dto.pointsValue !== undefined ? { pointsValue: dto.pointsValue } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async listPhase1Responses(dto: AdminPaginationDto) {
    const { take, skip, currentPage } = this.toPagination(dto.page, dto.pageSize);
    const where: Prisma.Phase1ResponseWhereInput = dto.q
      ? { assessmentId: { contains: dto.q, mode: 'insensitive' } }
      : {};
    const [total, data] = await this.prisma.$transaction([
      this.prisma.phase1Response.count({ where }),
      this.prisma.phase1Response.findMany({
        where,
        include: { question: true, assessment: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);
    return { page: currentPage, pageSize: take, total, data };
  }

  async getPhase1Response(id: string) {
    const item = await this.prisma.phase1Response.findUnique({
      where: { id },
      include: { question: true, assessment: true },
    });
    if (!item) throw new NotFoundException('Réponse phase 1 introuvable');
    return item;
  }

  async deletePhase1Response(id: string) {
    await this.getPhase1Response(id);
    return this.prisma.phase1Response.delete({ where: { id } });
  }

  async listPhase2Responses(dto: AdminPaginationDto) {
    const { take, skip, currentPage } = this.toPagination(dto.page, dto.pageSize);
    const where: Prisma.Phase2ResponseWhereInput = dto.q
      ? { assessmentId: { contains: dto.q, mode: 'insensitive' } }
      : {};
    const [total, data] = await this.prisma.$transaction([
      this.prisma.phase2Response.count({ where }),
      this.prisma.phase2Response.findMany({
        where,
        include: { question: true, assessment: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);
    return { page: currentPage, pageSize: take, total, data };
  }

  async getPhase2Response(id: string) {
    const item = await this.prisma.phase2Response.findUnique({
      where: { id },
      include: { question: true, assessment: true },
    });
    if (!item) throw new NotFoundException('Réponse phase 2 introuvable');
    return item;
  }

  async deletePhase2Response(id: string) {
    await this.getPhase2Response(id);
    return this.prisma.phase2Response.delete({ where: { id } });
  }

  async listResults(dto: AdminPaginationDto) {
    const { take, skip, currentPage } = this.toPagination(dto.page, dto.pageSize);
    const where: Prisma.AssessmentResultWhereInput = dto.q
      ? { OR: [{ phase1Code: { contains: dto.q } }, { phase2Code: { contains: dto.q } }] }
      : {};
    const [total, data] = await this.prisma.$transaction([
      this.prisma.assessmentResult.count({ where }),
      this.prisma.assessmentResult.findMany({
        where,
        include: { assessment: true, careerRecommendations: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);
    return { page: currentPage, pageSize: take, total, data };
  }

  async getResult(id: string) {
    const item = await this.prisma.assessmentResult.findUnique({
      where: { id },
      include: { assessment: true, careerRecommendations: true },
    });
    if (!item) throw new NotFoundException('Résultat introuvable');
    return item;
  }

  async deleteResult(id: string) {
    await this.getResult(id);
    return this.prisma.assessmentResult.delete({ where: { id } });
  }

  async listRecommendations(dto: AdminPaginationDto) {
    const { take, skip, currentPage } = this.toPagination(dto.page, dto.pageSize);
    const where: Prisma.AssessmentCareerRecommendationWhereInput = dto.q
      ? { resultId: { contains: dto.q, mode: 'insensitive' } }
      : {};
    const [total, data] = await this.prisma.$transaction([
      this.prisma.assessmentCareerRecommendation.count({ where }),
      this.prisma.assessmentCareerRecommendation.findMany({
        where,
        include: { career: true, result: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);
    return { page: currentPage, pageSize: take, total, data };
  }

  async deleteRecommendation(id: string) {
    const item = await this.prisma.assessmentCareerRecommendation.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Recommandation introuvable');
    return this.prisma.assessmentCareerRecommendation.delete({ where: { id } });
  }

  async listBadges(dto: AdminPaginationDto) {
    const { take, skip, currentPage } = this.toPagination(dto.page, dto.pageSize);
    const where: Prisma.BadgeWhereInput = dto.q
      ? {
          OR: [
            { code: { contains: dto.q, mode: 'insensitive' } },
            { name: { contains: dto.q, mode: 'insensitive' } },
          ],
        }
      : {};
    const [total, data] = await this.prisma.$transaction([
      this.prisma.badge.count({ where }),
      this.prisma.badge.findMany({
        where,
        include: { _count: { select: { sessionBadges: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);
    return { page: currentPage, pageSize: take, total, data };
  }

  async getBadge(id: number) {
    const badge = await this.prisma.badge.findUnique({
      where: { id },
      include: { sessionBadges: true },
    });
    if (!badge) throw new NotFoundException('Badge introuvable');
    return badge;
  }

  async deleteBadge(id: number) {
    await this.getBadge(id);
    return this.prisma.badge.delete({ where: { id } });
  }

  async listTreasureMaps(dto: AdminPaginationDto) {
    const { take, skip, currentPage } = this.toPagination(dto.page, dto.pageSize);
    const where: Prisma.TreasureMapWhereInput = dto.q
      ? {
          OR: [
            { assessmentId: { contains: dto.q, mode: 'insensitive' } },
            { shareToken: { contains: dto.q, mode: 'insensitive' } },
          ],
        }
      : {};
    const [total, data] = await this.prisma.$transaction([
      this.prisma.treasureMap.count({ where }),
      this.prisma.treasureMap.findMany({
        where,
        include: { assessment: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);
    return { page: currentPage, pageSize: take, total, data };
  }

  async deleteTreasureMap(id: string) {
    const item = await this.prisma.treasureMap.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Treasure map introuvable');
    return this.prisma.treasureMap.delete({ where: { id } });
  }

  async listFeedbacks(dto: AdminPaginationDto) {
    const { take, skip, currentPage } = this.toPagination(dto.page, dto.pageSize);
    const where: Prisma.AssessmentFeedbackWhereInput = dto.q
      ? { assessmentId: { contains: dto.q, mode: 'insensitive' } }
      : {};
    const [total, data] = await this.prisma.$transaction([
      this.prisma.assessmentFeedback.count({ where }),
      this.prisma.assessmentFeedback.findMany({
        where,
        include: { assessment: true, recommendation: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);
    return { page: currentPage, pageSize: take, total, data };
  }

  async getFeedback(id: string) {
    const item = await this.prisma.assessmentFeedback.findUnique({
      where: { id },
      include: { assessment: true, recommendation: true },
    });
    if (!item) throw new NotFoundException('Feedback introuvable');
    return item;
  }

  async createFeedback(dto: Record<string, unknown>) {
    return this.prisma.assessmentFeedback.create({
      data: dto as Prisma.AssessmentFeedbackUncheckedCreateInput,
    });
  }

  async updateFeedback(id: string, dto: Record<string, unknown>) {
    await this.getFeedback(id);
    return this.prisma.assessmentFeedback.update({
      where: { id },
      data: dto,
    });
  }

  async deleteFeedback(id: string) {
    await this.getFeedback(id);
    return this.prisma.assessmentFeedback.delete({ where: { id } });
  }

  async listOutcomes(dto: AdminPaginationDto) {
    const { take, skip, currentPage } = this.toPagination(dto.page, dto.pageSize);
    const where: Prisma.AssessmentOutcomeWhereInput = dto.q
      ? { assessmentId: { contains: dto.q, mode: 'insensitive' } }
      : {};
    const [total, data] = await this.prisma.$transaction([
      this.prisma.assessmentOutcome.count({ where }),
      this.prisma.assessmentOutcome.findMany({
        where,
        include: { assessment: true, career: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);
    return { page: currentPage, pageSize: take, total, data };
  }

  async getOutcome(id: string) {
    const item = await this.prisma.assessmentOutcome.findUnique({
      where: { id },
      include: { assessment: true, career: true },
    });
    if (!item) throw new NotFoundException('Outcome introuvable');
    return item;
  }

  async createOutcome(dto: Record<string, unknown>) {
    return this.prisma.assessmentOutcome.create({
      data: dto as Prisma.AssessmentOutcomeUncheckedCreateInput,
    });
  }

  async updateOutcome(id: string, dto: Record<string, unknown>) {
    await this.getOutcome(id);
    return this.prisma.assessmentOutcome.update({
      where: { id },
      data: dto,
    });
  }

  async deleteOutcome(id: string) {
    await this.getOutcome(id);
    return this.prisma.assessmentOutcome.delete({ where: { id } });
  }

  async listInteractions(dto: AdminPaginationDto) {
    const { take, skip, currentPage } = this.toPagination(dto.page, dto.pageSize);
    const where: Prisma.AssessmentInteractionWhereInput = dto.q
      ? { assessmentId: { contains: dto.q, mode: 'insensitive' } }
      : {};
    const [total, data] = await this.prisma.$transaction([
      this.prisma.assessmentInteraction.count({ where }),
      this.prisma.assessmentInteraction.findMany({
        where,
        include: { assessment: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);
    return { page: currentPage, pageSize: take, total, data };
  }

  async getInteraction(id: string) {
    const parsed = BigInt(id);
    const item = await this.prisma.assessmentInteraction.findUnique({
      where: { id: parsed },
      include: { assessment: true },
    });
    if (!item) throw new NotFoundException('Interaction introuvable');
    return item;
  }

  async createInteraction(dto: Record<string, unknown>) {
    return this.prisma.assessmentInteraction.create({
      data: dto as Prisma.AssessmentInteractionUncheckedCreateInput,
    });
  }

  async updateInteraction(id: string, dto: Record<string, unknown>) {
    const parsed = BigInt(id);
    await this.getInteraction(id);
    return this.prisma.assessmentInteraction.update({
      where: { id: parsed },
      data: dto,
    });
  }

  async deleteInteraction(id: string) {
    const parsed = BigInt(id);
    await this.getInteraction(id);
    return this.prisma.assessmentInteraction.delete({ where: { id: parsed } });
  }

  async listSessionBadges(dto: AdminPaginationDto) {
    const { take, skip, currentPage } = this.toPagination(dto.page, dto.pageSize);
    const where: Prisma.SessionBadgeWhereInput = dto.q
      ? { sessionId: { contains: dto.q, mode: 'insensitive' } }
      : {};
    const [total, data] = await this.prisma.$transaction([
      this.prisma.sessionBadge.count({ where }),
      this.prisma.sessionBadge.findMany({
        where,
        include: { session: true, badge: true },
        orderBy: { unlockedAt: 'desc' },
        skip,
        take,
      }),
    ]);
    return { page: currentPage, pageSize: take, total, data };
  }

  async getSessionBadge(id: string) {
    const item = await this.prisma.sessionBadge.findUnique({
      where: { id },
      include: { session: true, badge: true },
    });
    if (!item) throw new NotFoundException('Session badge introuvable');
    return item;
  }

  async createSessionBadge(dto: Record<string, unknown>) {
    return this.prisma.sessionBadge.create({
      data: dto as Prisma.SessionBadgeUncheckedCreateInput,
    });
  }

  async updateSessionBadge(id: string, dto: Record<string, unknown>) {
    await this.getSessionBadge(id);
    return this.prisma.sessionBadge.update({
      where: { id },
      data: dto,
    });
  }

  async deleteSessionBadge(id: string) {
    await this.getSessionBadge(id);
    return this.prisma.sessionBadge.delete({ where: { id } });
  }

  async listXpHistory(dto: AdminPaginationDto) {
    const { take, skip, currentPage } = this.toPagination(dto.page, dto.pageSize);
    const where: Prisma.XPHistoryWhereInput = dto.q
      ? {
          OR: [
            { sessionId: { contains: dto.q, mode: 'insensitive' } },
            { reason: { contains: dto.q, mode: 'insensitive' } },
          ],
        }
      : {};
    const [total, data] = await this.prisma.$transaction([
      this.prisma.xPHistory.count({ where }),
      this.prisma.xPHistory.findMany({
        where,
        include: { session: true, assessment: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);
    return { page: currentPage, pageSize: take, total, data };
  }

  async getXpHistory(id: string) {
    const item = await this.prisma.xPHistory.findUnique({
      where: { id },
      include: { session: true, assessment: true },
    });
    if (!item) throw new NotFoundException('XP history introuvable');
    return item;
  }

  async createXpHistory(dto: Record<string, unknown>) {
    return this.prisma.xPHistory.create({
      data: dto as Prisma.XPHistoryUncheckedCreateInput,
    });
  }

  async updateXpHistory(id: string, dto: Record<string, unknown>) {
    await this.getXpHistory(id);
    return this.prisma.xPHistory.update({
      where: { id },
      data: dto,
    });
  }

  async deleteXpHistory(id: string) {
    await this.getXpHistory(id);
    return this.prisma.xPHistory.delete({ where: { id } });
  }
}
