import { Type } from 'class-transformer';
import { RiasecType, TestStatus, TestType, UserRole, UserStatus } from '@prisma/client';
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
  @IsEnum(TestStatus)
  status?: TestStatus;

  @IsOptional()
  @IsEnum(TestType)
  type?: TestType;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}

export class AdminGeneralQuestionsFilterDto extends AdminPaginationDto {
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

export class AdminSpecificQuestionsFilterDto extends AdminGeneralQuestionsFilterDto {
  @IsOptional()
  @IsEnum(TestType)
  category?: TestType;
}
