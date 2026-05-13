import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Phase1ResponseItemDto {
  @ApiProperty({ description: 'Question id', type: Number, example: 1 })
  @Type(() => Number)
  @IsInt()
  questionId!: number;

  @ApiProperty({ description: 'Response value', type: Number, example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1)
  responseValue!: number;

  @ApiPropertyOptional({ description: 'Response time ms', type: Number, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  responseTimeMs?: number;
}
