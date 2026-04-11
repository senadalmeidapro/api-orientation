import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CareerCategory } from '@prisma/client';
import { Type } from 'class-transformer';

export class ListCareersDto {
    @IsOptional()
    @IsString()
    q?: string;

    @IsOptional()
    @IsEnum(CareerCategory)
    category?: CareerCategory;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    activeOnly?: boolean;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    featuredOnly?: boolean;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;
}
