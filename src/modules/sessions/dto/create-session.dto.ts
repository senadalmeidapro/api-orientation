import { IsEnum, IsInt, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AssessmentType } from '@prisma/client';

export class CreateSessionDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    testVersionId?: number;

    @IsOptional()
    @IsEnum(AssessmentType)
    initialAssessmentType?: AssessmentType;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(20)
    depth?: number;

    @IsOptional()
    @IsObject()
    profile?: Record<string, unknown>;
}
