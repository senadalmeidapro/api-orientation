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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetRecommendationsDto {
    @ApiProperty({ description: 'Session token', type: String, example: 'tok_sample_123456' })
    @IsString()
    sessionToken!: string;

    @ApiPropertyOptional({ description: 'Assessment id', type: String, example: 'clx123abc0001' })
    @IsOptional()
    @IsString()
    assessmentId?: string;

    @ApiPropertyOptional({ description: 'Limit', type: Number, example: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;

    @ApiPropertyOptional({
        description: 'Category',
        enum: CareerCategory,
        example: Object.values(CareerCategory)[0],
    })
    @IsOptional()
    @IsEnum(CareerCategory)
    category?: CareerCategory;

    @ApiPropertyOptional({ description: 'Force', type: Boolean, example: true })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    force?: boolean;

    @ApiPropertyOptional({ description: 'Advanced', type: Boolean, example: true })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    advanced?: boolean;

    @ApiPropertyOptional({ description: 'Latitude', type: Number, example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    latitude?: number;

    @ApiPropertyOptional({ description: 'Longitude', type: Number, example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    longitude?: number;

    @ApiPropertyOptional({ description: 'Radius km', type: Number, example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(500)
    radiusKm?: number;
}
