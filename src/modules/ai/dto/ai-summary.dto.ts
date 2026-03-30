import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class AiSummaryDto {
    @IsString()
    sessionToken!: string;

    @IsOptional()
    @IsString()
    assessmentId?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(12)
    limit?: number;
}
