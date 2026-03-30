import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Phase2Type } from '@prisma/client';

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
    @IsString()
    lang?: string;
}
