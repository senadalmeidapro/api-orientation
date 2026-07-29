import { Type } from 'class-transformer';
import { RiasecType, TestType } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateGeneralQuestionAdminDto {
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

export class UpdateGeneralQuestionAdminDto {
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

export class CreateSpecificQuestionAdminDto extends CreateGeneralQuestionAdminDto {
  @IsEnum(TestType)
  category!: TestType;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  questionSubtext?: string;
}

export class UpdateSpecificQuestionAdminDto extends UpdateGeneralQuestionAdminDto {
  @IsOptional()
  @IsEnum(TestType)
  category?: TestType;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  questionSubtext?: string;
}
