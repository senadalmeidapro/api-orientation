import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListTrainingPathsDto {
    @ApiPropertyOptional({ description: 'Career id', type: Number, example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    careerId?: number;

    @ApiPropertyOptional({ description: 'Institution id', type: Number, example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    institutionId?: number;

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
