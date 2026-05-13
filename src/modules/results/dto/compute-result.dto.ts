import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ComputeResultDto {
  @ApiProperty({ description: 'Session token', type: String, example: 'tok_sample_123456' })
  @IsString()
  sessionToken!: string;

  @ApiPropertyOptional({ description: 'Assessment id', type: String, example: 'clx123abc0001' })
  @IsOptional()
  @IsString()
  assessmentId?: string;

  @ApiPropertyOptional({
    description: 'Subjective ranking',
    type: Object,
    example: { key: 'value' },
  })
  @IsOptional()
  @IsObject()
  subjectiveRanking?: Record<string, number>;

  @ApiPropertyOptional({ description: 'Force', type: Boolean, example: true })
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}
