import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { TestType } from '@prisma/client';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetQuestionsDto {
  @ApiProperty({ description: 'Session token', type: String, example: 'tok_sample_123456' })
  @IsString()
  sessionToken!: string;

  @ApiPropertyOptional({ description: 'Assessment id', type: String, example: 'clx123abc0001' })
  @IsOptional()
  @IsString()
  assessmentId?: string;

  @ApiPropertyOptional({
    description: 'Section',
    enum: TestType,
    example: Object.values(TestType)[0],
  })
  @IsOptional()
  @IsEnum(TestType)
  currentCategory!: TestType;

  @ApiPropertyOptional({ description: 'Take', type: Number, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  take?: number;

  @ApiPropertyOptional({ description: 'Lang', type: String, example: 'value' })
  @IsOptional()
  @IsString()
  lang?: string;
}
