import { IsBoolean, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { RiasecType } from '@prisma/client';

export class CreatePhase1QuestionDto {
    @IsEnum(RiasecType)
    riasecTypeId!: RiasecType;

    @IsString()
    questionText!: string;

    @IsOptional()
    @IsString()
    questionShort?: string;

    @IsOptional()
    @IsString()
    illustrationUrl?: string;

    @Type(() => Number)
    @IsInt()
    displayOrder!: number;

    @Type(() => Number)
    @IsInt()
    testVersionId!: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
