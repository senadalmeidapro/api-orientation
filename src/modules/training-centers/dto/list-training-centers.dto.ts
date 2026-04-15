import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListTrainingCentersDto {
    @ApiPropertyOptional({ description: 'Q', type: String, example: 'value' })
    @IsOptional()
    @IsString()
    q?: string;

    @ApiPropertyOptional({ description: 'Department', type: String, example: 'value' })
    @IsOptional()
    @IsString()
    department?: string;

    @ApiPropertyOptional({ description: 'City', type: String, example: 'value' })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({ description: 'Active only', type: Boolean, example: true })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    activeOnly?: boolean;

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
