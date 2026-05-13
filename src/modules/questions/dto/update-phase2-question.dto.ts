import { IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { RiasecType, Phase2Type } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePhase2QuestionDto {
  @ApiPropertyOptional({
    description: 'Riasec type id',
    enum: RiasecType,
    example: Object.values(RiasecType)[0],
  })
  @IsOptional()
  @IsEnum(RiasecType)
  riasecTypeId?: RiasecType;

  @ApiPropertyOptional({
    description: 'Phase2 type',
    enum: Phase2Type,
    example: Object.values(Phase2Type)[0],
  })
  @IsOptional()
  @IsEnum(Phase2Type)
  phase2Type?: Phase2Type;

  @ApiPropertyOptional({ description: 'Question text', type: String, example: 'value' })
  @IsOptional()
  @IsString()
  questionText?: string;

  @ApiPropertyOptional({ description: 'Question subtext', type: String, example: 'value' })
  @IsOptional()
  @IsString()
  questionSubtext?: string;

  @ApiPropertyOptional({ description: 'Media url', type: String, example: 'https://example.com' })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional({ description: 'Display order', type: Number, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Min value', type: Number, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minValue?: number;

  @ApiPropertyOptional({ description: 'Max value', type: Number, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxValue?: number;

  @ApiPropertyOptional({ description: 'Value labels', type: Object, example: { key: 'value' } })
  @IsOptional()
  @IsObject()
  valueLabels?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Is active', type: Boolean, example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
