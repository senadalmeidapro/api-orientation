import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CareerCategory } from '@prisma/client';

export class GetRecommendationsDto {
    @IsString()
    sessionToken!: string;

    @IsOptional()
    @IsString()
    assessmentId?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;

    @IsOptional()
    @IsEnum(CareerCategory)
    category?: CareerCategory;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    force?: boolean;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    advanced?: boolean;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    latitude?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    longitude?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(500)
    radiusKm?: number;
}
