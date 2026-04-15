import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListResourcesDto {
    @ApiPropertyOptional({ description: 'Q', type: String, example: 'value' })
    @IsOptional()
    @IsString()
    q?: string;

    @ApiPropertyOptional({
        description: 'Category',
        type: String,
        example: '2026-01-01T00:00:00.000Z',
    })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({ description: 'Published only', type: Boolean, example: true })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    publishedOnly?: boolean;

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
