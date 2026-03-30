import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SectionType } from '@prisma/client';

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
    @IsEnum(SectionType)
    section?: SectionType;

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
