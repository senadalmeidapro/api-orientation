import { IsBoolean, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { RiasecType } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePhase1QuestionDto {
    @ApiPropertyOptional({
        description: 'Riasec type id',
        enum: RiasecType,
        example: Object.values(RiasecType)[0],
    })
    @IsOptional()
    @IsEnum(RiasecType)
    riasecTypeId?: RiasecType;

    @ApiPropertyOptional({ description: 'Question text', type: String, example: 'value' })
    @IsOptional()
    @IsString()
    questionText?: string;

    @ApiPropertyOptional({ description: 'Question short', type: String, example: 'value' })
    @IsOptional()
    @IsString()
    questionShort?: string;

    @ApiPropertyOptional({
        description: 'Illustration url',
        type: String,
        example: 'https://example.com',
    })
    @IsOptional()
    @IsString()
    illustrationUrl?: string;

    @ApiPropertyOptional({ description: 'Display order', type: Number, example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    displayOrder?: number;

    @ApiPropertyOptional({ description: 'Is active', type: Boolean, example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
