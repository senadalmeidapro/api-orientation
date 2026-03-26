import { IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { RiasecType, SectionType } from '@prisma/client';

export class CreatePhase2QuestionDto {
    @IsEnum(RiasecType)
    riasecTypeId!: RiasecType;

    @IsEnum(SectionType)
    sectionType!: SectionType;

    @IsString()
    questionText!: string;

    @IsOptional()
    @IsString()
    questionSubtext?: string;

    @IsOptional()
    @IsString()
    mediaUrl?: string;

    @Type(() => Number)
    @IsInt()
    displayOrder!: number;

    @Type(() => Number)
    @IsInt()
    testVersionId!: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    minValue?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    maxValue?: number;

    @IsOptional()
    @IsObject()
    valueLabels?: Record<string, string>;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
