import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Phase2Type } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetNextQuestionsDto {
  @ApiProperty({ description: 'Session token', type: String, example: 'tok_sample_123456' })
  @IsString()
  sessionToken!: string;

  @ApiPropertyOptional({ description: 'Max questions', type: Number, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  maxQuestions?: number;

  @ApiPropertyOptional({
    description: 'Section',
    enum: Phase2Type,
    example: Object.values(Phase2Type)[0],
  })
  @IsOptional()
  @IsEnum(Phase2Type)
  section?: Phase2Type;

  @ApiPropertyOptional({ description: 'Lang', type: String, example: 'value' })
  @IsOptional()
  @IsString()
  lang?: string;

  @ApiPropertyOptional({ description: 'Message', type: String, example: 'Message exemple' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Ai', type: String, example: 'value' })
  @IsOptional()
  @IsString()
  ai?: string;
}
