import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

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
}
