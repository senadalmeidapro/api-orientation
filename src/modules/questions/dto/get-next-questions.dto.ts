import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Phase2Type } from '@prisma/client';

export class GetNextQuestionsDto {
    @IsString()
    sessionToken!: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(10)
    maxQuestions?: number;

    @IsOptional()
    @IsEnum(Phase2Type)
    section?: Phase2Type;

    @IsOptional()
    @IsString()
    lang?: string;

    @IsOptional()
    @IsString()
    message?: string;

    @IsOptional()
    @IsString()
    ai?: string;
}
