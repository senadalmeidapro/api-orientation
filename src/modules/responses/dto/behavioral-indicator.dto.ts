import { ApiProperty } from '@nestjs/swagger';

export class BehavioralIndicatorDto {
    @ApiProperty({
        description: 'Type of behavioral indicator',
        enum: ['hesitation', 'doubt', 'change', 'excitement', 'consistent'],
    })
    type!: string;

    @ApiProperty({ description: 'Time taken in milliseconds', required: false })
    timeTakenMs?: number;

    @ApiProperty({ description: 'Number of changes', required: false })
    changeCount?: number;

    @ApiProperty({
        description: 'Additional metadata',
        required: false,
        example: { threshold: 15000 },
    })
    metadata?: Record<string, any>;

    @ApiProperty({ description: 'Detection timestamp' })
    detectedAt!: Date;
}

export class BehavioralMetricsDto {
    @ApiProperty({ description: 'Average response time in milliseconds' })
    averageResponseTime!: number;

    @ApiProperty({ description: 'Standard deviation of response times' })
    responseTimeStdDev!: number;

    @ApiProperty({ description: 'Total number of answer changes' })
    totalChanges!: number;

    @ApiProperty({ description: 'Count of hesitation indicators' })
    hesitationCount!: number;

    @ApiProperty({ description: 'Count of doubt indicators' })
    doubtCount!: number;

    @ApiProperty({ description: 'Count of excitement indicators' })
    excitementCount!: number;

    @ApiProperty({ description: 'Count of consistent indicators' })
    consistentCount!: number;
}

export class BehavioralInsightsDto {
    @ApiProperty({
        description: 'Dominant behavioral pattern',
        enum: ['confident', 'uncertain', 'impulsive', 'deliberate', 'mixed'],
    })
    dominantPattern!: string;

    @ApiProperty({ description: 'Confidence level (0-1)' })
    confidence!: number;

    @ApiProperty({
        description: 'Key observations',
        type: [String],
        example: ['5 réponses avec hésitation détectée (31.2%)'],
    })
    observations!: string[];

    @ApiProperty({
        description: 'Personalized recommendations',
        type: [String],
        example: ['Prendre le temps de réfléchir est normal...'],
    })
    recommendations!: string[];

    @ApiProperty({ description: 'Behavioral metrics' })
    metrics!: BehavioralMetricsDto;
}
