import { Type } from 'class-transformer';
import { Phase2Type, RiasecType } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreatePhase1QuestionAdminDto {
  @IsEnum(RiasecType)
  riasecTypeId!: RiasecType;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  testVersionId!: number;

  @IsString()
  @MaxLength(2000)
  questionText!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  questionShort?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pointsValue?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePhase1QuestionAdminDto {
  @IsOptional()
  @IsEnum(RiasecType)
  riasecTypeId?: RiasecType;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  questionText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  questionShort?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pointsValue?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreatePhase2QuestionAdminDto extends CreatePhase1QuestionAdminDto {
  @IsEnum(Phase2Type)
  phase2Type!: Phase2Type;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  questionSubtext?: string;
}

export class UpdatePhase2QuestionAdminDto extends UpdatePhase1QuestionAdminDto {
  @IsOptional()
  @IsEnum(Phase2Type)
  phase2Type?: Phase2Type;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  questionSubtext?: string;
}
