import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTrainingPathDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    level?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    durationMonths?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    costMin?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    costMax?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    careerId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    institutionId?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
