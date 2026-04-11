import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListTrainingPathsDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    careerId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    institutionId?: number;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    activeOnly?: boolean;

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
