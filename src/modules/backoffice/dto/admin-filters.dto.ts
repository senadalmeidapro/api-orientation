import { Type } from 'class-transformer';
import {
  AssessmentStatus,
  AssessmentType,
  Phase2Type,
  RiasecType,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { AdminPaginationDto } from './admin-pagination.dto';

export class AdminUsersFilterDto extends AdminPaginationDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export class AdminSessionsFilterDto extends AdminPaginationDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}

export class AdminAssessmentsFilterDto extends AdminPaginationDto {
  @IsOptional()
  @IsEnum(AssessmentStatus)
  status?: AssessmentStatus;

  @IsOptional()
  @IsEnum(AssessmentType)
  type?: AssessmentType;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}

export class AdminPhase1QuestionsFilterDto extends AdminPaginationDto {
  @IsOptional()
  @Type(() => Number)
  testVersionId?: number;

  @IsOptional()
  @IsEnum(RiasecType)
  riasecTypeId?: RiasecType;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}

export class AdminPhase2QuestionsFilterDto extends AdminPhase1QuestionsFilterDto {
  @IsOptional()
  @IsEnum(Phase2Type)
  phase2Type?: Phase2Type;
}
