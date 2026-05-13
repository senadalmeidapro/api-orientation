import { IsEnum, IsInt, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { InteractionEntityType, InteractionEventType } from '@prisma/client';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInteractionDto {
  @ApiProperty({ description: 'Session token', type: String, example: 'tok_sample_123456' })
  @IsString()
  sessionToken!: string;

  @ApiPropertyOptional({ description: 'Assessment id', type: String, example: 'clx123abc0001' })
  @IsOptional()
  @IsString()
  assessmentId?: string;

  @ApiProperty({
    description: 'Type',
    enum: InteractionEventType,
    example: Object.values(InteractionEventType)[0],
  })
  @IsEnum(InteractionEventType)
  type!: InteractionEventType;

  @ApiProperty({
    description: 'Entity type',
    enum: InteractionEntityType,
    example: Object.values(InteractionEntityType)[0],
  })
  @IsEnum(InteractionEntityType)
  entityType!: InteractionEntityType;

  @ApiProperty({ description: 'Entity id', type: Number, example: 1 })
  @Type(() => Number)
  @IsInt()
  entityId!: number;

  @ApiPropertyOptional({ description: 'Value', type: Number, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  value?: number;

  @ApiPropertyOptional({ description: 'Metadata', type: Object, example: { key: 'value' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
