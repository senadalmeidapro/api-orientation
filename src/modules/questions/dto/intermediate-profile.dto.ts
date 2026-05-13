import { ApiProperty } from '@nestjs/swagger';
import { RiasecType } from '@prisma/client';

export class IntermediateProfileDto {
  @ApiProperty({ description: 'Batch index' })
  batchIndex!: number;

  @ApiProperty({ description: 'Phase type (PHASE1 or PHASE2)' })
  phaseType!: string;

  @ApiProperty({
    description: 'Normalized RIASEC profile scores',
    example: { R: 0.25, I: 0.18, A: 0.15, S: 0.2, E: 0.12, C: 0.1 },
  })
  profileData!: Record<RiasecType, number>;

  @ApiProperty({
    description: 'Raw scores before normalization',
    example: { R: 25, I: 18, A: 15, S: 20, E: 12, C: 10 },
  })
  rawScores!: Record<RiasecType, number>;

  @ApiProperty({ description: 'Calculation timestamp' })
  calculatedAt!: Date;

  @ApiProperty({
    description: 'Dominant profile code (top 3 types)',
    example: 'RSI',
  })
  dominantCode?: string;

  @ApiProperty({
    description: 'Top three profiles with percentages',
    example: [
      { type: 'R', score: 25, percentage: 25.0 },
      { type: 'S', score: 20, percentage: 20.0 },
      { type: 'I', score: 18, percentage: 18.0 },
    ],
  })
  topThree?: Array<{ type: RiasecType; score: number; percentage: number }>;
}
