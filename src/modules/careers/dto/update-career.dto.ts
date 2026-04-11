import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CareerCategory, RiasecType } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateCareerDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    summary?: string;

    @IsOptional()
    @IsArray()
    @IsEnum(RiasecType, { each: true })
    riasecCodes?: RiasecType[];

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(5)
    localDemand?: number;

    @IsOptional()
    @IsString()
    formationLevel?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    salaryRangeMin?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    salaryRangeMax?: number;

    @IsOptional()
    @IsString()
    careerPath?: string;

    @IsOptional()
    @IsString()
    iconUrl?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsString()
    videoUrl?: string;

    @IsOptional()
    @IsEnum(CareerCategory)
    category?: CareerCategory;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    institutionIds?: number[];

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    resourceIds?: number[];
}
