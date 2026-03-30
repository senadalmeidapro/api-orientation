import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AssessmentType } from '@prisma/client';

export class CreateAssessmentDto {
    @IsEnum(AssessmentType)
    type!: AssessmentType;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    testVersionId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(20)
    depth?: number;
}
