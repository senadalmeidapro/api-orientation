import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { OutcomeStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOutcomeDto {
  @ApiProperty({ description: 'Session token', type: String, example: 'tok_sample_123456' })
  @IsString()
  sessionToken!: string;

  @ApiPropertyOptional({ description: 'Assessment id', type: String, example: 'clx123abc0001' })
  @IsOptional()
  @IsString()
  assessmentId?: string;

  @ApiProperty({ description: 'Career id', type: Number, example: 1 })
  @Type(() => Number)
  @IsInt()
  careerId!: number;

  @ApiProperty({
    description: 'Status',
    enum: OutcomeStatus,
    example: Object.values(OutcomeStatus)[0],
  })
  @IsEnum(OutcomeStatus)
  status!: OutcomeStatus;

  @ApiProperty({ description: 'Sector', type: String, example: '2026-01-01T00:00:00.000Z' })
  @IsString()
  sector!: string;

  @ApiPropertyOptional({ description: 'Salary range', type: String, example: 'value' })
  @IsOptional()
  @IsString()
  salaryRange?: string;

  @ApiPropertyOptional({ description: 'Delay to outcome', type: Number, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  delayToOutcome!: number;
}
