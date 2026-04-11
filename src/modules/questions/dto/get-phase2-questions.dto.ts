import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Phase2Type } from '@prisma/client';
import { Type } from 'class-transformer';

export class GetPhase2QuestionsDto {
    @IsString()
    sessionToken!: string;

    @IsOptional()
    @IsString()
    assessmentId?: string;

    @IsOptional()
    @IsEnum(Phase2Type)
    section?: Phase2Type;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(60)
    take?: number;

    @IsOptional()
    @IsString()
    lang?: string;
}
