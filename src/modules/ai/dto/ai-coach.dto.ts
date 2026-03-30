import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Phase2Type } from '@prisma/client';

export class AiCoachDto {
    @IsString()
    sessionToken!: string;

    @IsOptional()
    @IsString()
    assessmentId?: string;

    @IsOptional()
    @IsString()
    message?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(10)
    maxQuestions?: number;

    @IsOptional()
    @IsEnum(Phase2Type)
    section?: Phase2Type;
}
