import { ApiProperty } from '@nestjs/swagger';

class RoleBreakdownDto {
  @ApiProperty()
  ADMIN!: number;
  @ApiProperty()
  AGENT!: number;
  @ApiProperty()
  USER!: number;
}

class StatusBreakdownDto {
  @ApiProperty()
  ACTIVE!: number;
  @ApiProperty()
  PENDING!: number;
  @ApiProperty()
  SUSPENDED!: number;
  @ApiProperty()
  DELETED!: number;
}

class AssessmentBreakdownDto {
  @ApiProperty()
  IN_PROGRESS!: number;
  @ApiProperty()
  COMPLETED!: number;
  @ApiProperty()
  ABANDONED!: number;
}

class SessionStateDto {
  @ApiProperty()
  active!: number;
  @ApiProperty()
  inactive!: number;
  @ApiProperty()
  current!: number;
  @ApiProperty()
  expired!: number;
}

class PublicationStatsDto {
  @ApiProperty()
  resourcesPublished!: number;
  @ApiProperty()
  resourcesDraft!: number;
}

class ActivationStatsDto {
  @ApiProperty()
  careersActive!: number;
  @ApiProperty()
  careersInactive!: number;
  @ApiProperty()
  universitiesActive!: number;
  @ApiProperty()
  universitiesInactive!: number;
  @ApiProperty()
  formationsActive!: number;
  @ApiProperty()
  formationsInactive!: number;
  @ApiProperty()
  scholarshipsActive!: number;
  @ApiProperty()
  scholarshipsInactive!: number;
  @ApiProperty()
  generalQuestionsActive!: number;
  @ApiProperty()
  generalQuestionsInactive!: number;
  @ApiProperty()
  specificQuestionsActive!: number;
  @ApiProperty()
  specificQuestionsInactive!: number;
}

class RecommendationStatsDto {
  @ApiProperty()
  viewed!: number;
  @ApiProperty()
  notViewed!: number;
  @ApiProperty()
  savedForLater!: number;
}

class TreasureMapStatsDto {
  @ApiProperty()
  viewed!: number;
  @ApiProperty()
  notViewed!: number;
  @ApiProperty()
  downloaded!: number;
}

class CoreTotalsDto {
  @ApiProperty()
  users!: number;
  @ApiProperty()
  sessions!: number;
  @ApiProperty()
  assessments!: number;
  @ApiProperty()
  careers!: number;
  @ApiProperty()
  resources!: number;
  @ApiProperty()
  universities!: number;
}

class ExtendedTotalsDto {
  @ApiProperty()
  testVersions!: number;
  @ApiProperty()
  languages!: number;
  @ApiProperty()
  generalQuestions!: number;
  @ApiProperty()
  specificQuestions!: number;
  @ApiProperty()
  generalResponses!: number;
  @ApiProperty()
  specificResponses!: number;
  @ApiProperty()
  assessmentResults!: number;
  @ApiProperty()
  recommendations!: number;
  @ApiProperty()
  treasureMaps!: number;
  @ApiProperty()
  formations!: number;
  @ApiProperty()
  scholarships!: number;
  @ApiProperty()
  badges!: number;
  @ApiProperty()
  sessionBadges!: number;
  @ApiProperty()
  xpHistory!: number;
  @ApiProperty()
  feedbacks!: number;
  @ApiProperty()
  outcomes!: number;
  @ApiProperty()
  interactions!: number;
}

class PeriodTotalsDto {
  @ApiProperty()
  users!: number;
  @ApiProperty()
  sessions!: number;
  @ApiProperty()
  assessments!: number;
  @ApiProperty()
  generalResponses!: number;
  @ApiProperty()
  specificResponses!: number;
  @ApiProperty()
  assessmentResults!: number;
  @ApiProperty()
  recommendations!: number;
  @ApiProperty()
  resources!: number;
  @ApiProperty()
  universities!: number;
  @ApiProperty()
  formations!: number;
  @ApiProperty()
  scholarships!: number;
  @ApiProperty()
  sessionBadges!: number;
  @ApiProperty()
  xpHistory!: number;
  @ApiProperty()
  feedbacks!: number;
  @ApiProperty()
  outcomes!: number;
  @ApiProperty()
  interactions!: number;
}

export class DashboardSummaryDto {
  @ApiProperty({ type: CoreTotalsDto })
  totals!: CoreTotalsDto;

  @ApiProperty({ type: ExtendedTotalsDto })
  totalsExtended!: ExtendedTotalsDto;

  @ApiProperty({ type: RoleBreakdownDto })
  usersByRole!: RoleBreakdownDto;

  @ApiProperty({ type: StatusBreakdownDto })
  usersByStatus!: StatusBreakdownDto;

  @ApiProperty({ type: AssessmentBreakdownDto })
  assessmentsByStatus!: AssessmentBreakdownDto;

  @ApiProperty({ type: SessionStateDto })
  sessionsByState!: SessionStateDto;

  @ApiProperty({ type: PublicationStatsDto })
  publicationStats!: PublicationStatsDto;

  @ApiProperty({ type: ActivationStatsDto })
  activationStats!: ActivationStatsDto;

  @ApiProperty({ type: RecommendationStatsDto })
  recommendationStats!: RecommendationStatsDto;

  @ApiProperty({ type: TreasureMapStatsDto })
  treasureMapStats!: TreasureMapStatsDto;

  @ApiProperty({ type: PeriodTotalsDto })
  periodTotals!: PeriodTotalsDto;

  @ApiProperty({ example: null, nullable: true })
  periodFrom!: string | null;

  @ApiProperty({ example: null, nullable: true })
  periodTo!: string | null;
}
