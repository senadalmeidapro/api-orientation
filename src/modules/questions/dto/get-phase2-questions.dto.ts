import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SectionType } from '@prisma/client';

export class GetPhase2QuestionsDto {
    @IsString()
    sessionToken!: string;

    @IsEnum(SectionType)
    section!: SectionType;

    @IsOptional()
    @IsString()
    lang?: string;
}
