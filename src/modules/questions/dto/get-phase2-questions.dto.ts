import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { SectionType } from '@prisma/client';

export class GetPhase2QuestionsDto {
    @IsOptional()
    @IsString()
    sessionToken?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    testVersionId?: number;

    @IsEnum(SectionType)
    section!: SectionType;

    @IsOptional()
    @IsString()
    lang?: string;
}
