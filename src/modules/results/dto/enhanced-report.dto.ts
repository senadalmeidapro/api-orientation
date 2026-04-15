import { ApiProperty } from '@nestjs/swagger';
import { RiasecType } from '@prisma/client';

export class RiasecProfileDto {
    @ApiProperty({ description: 'RIASEC code (3-letter)', example: 'RIS' })
    code!: string;

    @ApiProperty({
        description: 'Normalized RIASEC scores',
        example: { R: 0.28, I: 0.22, A: 0.12, S: 0.18, E: 0.1, C: 0.1 },
    })
    scores!: Record<RiasecType, number>;

    @ApiProperty({
        description: 'Top three dominant profiles',
        example: [
            { type: 'R', score: 28, percentage: 28.0 },
            { type: 'I', score: 22, percentage: 22.0 },
            { type: 'S', score: 18, percentage: 18.0 },
        ],
    })
    dominant!: Array<{ type: RiasecType; score: number; percentage: number }>;
}

export class BehavioralAnalysisDto {
    @ApiProperty({ description: 'Dominant behavioral pattern' })
    dominantPattern!: string;

    @ApiProperty({ description: 'Confidence level' })
    confidence!: number;

    @ApiProperty({ description: 'Behavioral observations', type: [String] })
    observations!: string[];

    @ApiProperty({ description: 'Behavioral metrics' })
    metrics: any;
}

export class PsychologicalProfileDto {
    @ApiProperty({ description: 'Profile summary' })
    summary!: string;

    @ApiProperty({ description: 'Key personality traits', type: [String] })
    keyTraits!: string[];

    @ApiProperty({ description: 'Personalized recommendations', type: [String] })
    recommendations!: string[];
}

export class EnhancedReportSectionDto {
    @ApiProperty({ description: 'Section title' })
    title!: string;

    @ApiProperty({ description: 'Section content' })
    content!: string;

    @ApiProperty({ description: 'Key insights', type: [String] })
    insights!: string[];
}

export class EnhancedReportDto {
    @ApiProperty({ description: 'Assessment ID' })
    assessmentId!: string;

    @ApiProperty({ description: 'Report generation timestamp' })
    generatedAt!: Date;

    @ApiProperty({ description: 'RIASEC profile' })
    riasecProfile!: RiasecProfileDto;

    @ApiProperty({ description: 'Behavioral analysis' })
    behavioralAnalysis!: BehavioralAnalysisDto;

    @ApiProperty({ description: 'Psychological profile' })
    psychologicalProfile!: PsychologicalProfileDto;

    @ApiProperty({ description: 'Career recommendations', type: [String] })
    careerRecommendations!: string[];

    @ApiProperty({ description: 'Personalized action plan', type: [String] })
    actionPlan!: string[];

    @ApiProperty({
        description: 'Report sections',
        type: [EnhancedReportSectionDto],
    })
    sections!: EnhancedReportSectionDto[];
}
