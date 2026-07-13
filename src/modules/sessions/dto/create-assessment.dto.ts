import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TestType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssessmentDto {
  @ApiProperty({
    description: 'Type',
    enum: TestType,
    example: Object.values(TestType)[0],
  })
  @IsEnum(TestType)
  type!: TestType;

  @ApiPropertyOptional({ description: 'Test version id', type: Number, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  testVersionId?: number;

  @ApiPropertyOptional({ description: 'Depth', type: Number, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  depth?: number;
}
