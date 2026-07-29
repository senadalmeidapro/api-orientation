import { IsEnum, IsInt, IsObject, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TestType } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiPropertyOptional({ description: 'Test version id', type: Number, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  testVersionId?: number;

  @ApiPropertyOptional({
    description: 'Initial assessment type',
    enum: TestType,
    example: Object.values(TestType)[0],
  })
  @IsOptional()
  @IsEnum(TestType)
  initialTestType?: TestType;

  @ApiPropertyOptional({ description: 'Depth', type: Number, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  depth?: number;

  @ApiPropertyOptional({ description: 'Profile', type: Object, example: { key: 'value' } })
  @IsOptional()
  @IsObject()
  profile?: Record<string, unknown>;
}
