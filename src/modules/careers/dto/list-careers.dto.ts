import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CareerCategory } from '@prisma/client';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListCareersDto {
    @ApiPropertyOptional({ description: 'Q', type: String, example: 'value' })
    @IsOptional()
    @IsString()
    q?: string;

    @ApiPropertyOptional({
        description: 'Category',
        enum: CareerCategory,
        example: Object.values(CareerCategory)[0],
    })
    @IsOptional()
    @IsEnum(CareerCategory)
    category?: CareerCategory;

    @ApiPropertyOptional({ description: 'Active only', type: Boolean, example: true })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    activeOnly?: boolean;

    @ApiPropertyOptional({ description: 'Featured only', type: Boolean, example: true })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    featuredOnly?: boolean;

    @ApiPropertyOptional({ description: 'Offset', type: Number, example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset?: number;

    @ApiPropertyOptional({ description: 'Limit', type: Number, example: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;
}
