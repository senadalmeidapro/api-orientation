import { IsBoolean, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { RiasecType } from '@prisma/client';

export class UpdatePhase1QuestionDto {
    @IsOptional()
    @IsEnum(RiasecType)
    riasecTypeId?: RiasecType;

    @IsOptional()
    @IsString()
    questionText?: string;

    @IsOptional()
    @IsString()
    questionShort?: string;

    @IsOptional()
    @IsString()
    illustrationUrl?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    displayOrder?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
