import { IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { RiasecType, Phase2Type } from '@prisma/client';

export class UpdatePhase2QuestionDto {
    @IsOptional()
    @IsEnum(RiasecType)
    riasecTypeId?: RiasecType;

    @IsOptional()
    @IsEnum(Phase2Type)
    phase2Type?: Phase2Type;

    @IsOptional()
    @IsString()
    questionText?: string;

    @IsOptional()
    @IsString()
    questionSubtext?: string;

    @IsOptional()
    @IsString()
    mediaUrl?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    displayOrder?: number;

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
