import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CareerCategory, RiasecType } from '@prisma/client';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCareerDto {
  @ApiPropertyOptional({ description: 'Name', type: String, example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Description',
    type: String,
    example: 'Description exemple',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Summary', type: String, example: 'value' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: 'Riasec codes', type: [Object], example: [{}] })
  @IsOptional()
  @IsArray()
  @IsEnum(RiasecType, { each: true })
  riasecCodes?: RiasecType[];

  @ApiPropertyOptional({ description: 'Local demand', type: Number, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  localDemand?: number;

  @ApiPropertyOptional({
    description: 'Formation level',
    type: String,
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  formationLevel?: string;

  @ApiPropertyOptional({ description: 'Salary range min', type: Number, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  salaryRangeMin?: number;

  @ApiPropertyOptional({ description: 'Salary range max', type: Number, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  salaryRangeMax?: number;

  @ApiPropertyOptional({
    description: 'Career path',
    type: String,
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  careerPath?: string;

  @ApiPropertyOptional({ description: 'Icon url', type: String, example: 'https://example.com' })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiPropertyOptional({ description: 'Image url', type: String, example: 'https://example.com' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Video url', type: String, example: 'clx123abc0001' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({
    description: 'Category',
    enum: CareerCategory,
    example: Object.values(CareerCategory)[0],
  })
  @IsOptional()
  @IsEnum(CareerCategory)
  category?: CareerCategory;

  @ApiPropertyOptional({ description: 'Tags', type: [String], example: ['value-1', 'value-2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Is featured', type: Boolean, example: true })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Is active', type: Boolean, example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Formation ids', type: [Number], example: [1, 2] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  formationIds?: number[];

  @ApiPropertyOptional({
    description: 'Institution ids (deprecated, use formationIds)',
    type: [Number],
    example: [1, 2],
    deprecated: true,
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  institutionIds?: number[];

  @ApiPropertyOptional({ description: 'Resource ids', type: [Number], example: [1, 2] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  resourceIds?: number[];
}
