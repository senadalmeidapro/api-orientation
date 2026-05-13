import { IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { RiasecType, Phase2Type } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePhase2QuestionDto {
  @ApiProperty({
    description: 'Riasec type id',
    enum: RiasecType,
    example: Object.values(RiasecType)[0],
  })
  @IsEnum(RiasecType)
  riasecTypeId!: RiasecType;

  @ApiProperty({
    description: 'Phase2 type',
    enum: Phase2Type,
    example: Object.values(Phase2Type)[0],
  })
  @IsEnum(Phase2Type)
  phase2Type!: Phase2Type;

  @ApiProperty({ description: 'Question text', type: String, example: 'value' })
  @IsString()
  questionText!: string;

  @ApiPropertyOptional({ description: 'Question subtext', type: String, example: 'value' })
  @IsOptional()
  @IsString()
  questionSubtext?: string;

  @ApiPropertyOptional({ description: 'Media url', type: String, example: 'https://example.com' })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiProperty({ description: 'Display order', type: Number, example: 1 })
  @Type(() => Number)
  @IsInt()
  displayOrder!: number;

  @ApiProperty({ description: 'Test version id', type: Number, example: 1 })
  @Type(() => Number)
  @IsInt()
  testVersionId!: number;

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
