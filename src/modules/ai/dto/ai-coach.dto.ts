import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Phase2Type } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AiCoachDto {
    @ApiProperty({ description: 'Session token', type: String, example: 'tok_sample_123456' })
    @IsString()
    sessionToken!: string;

    @ApiPropertyOptional({ description: 'Assessment id', type: String, example: 'clx123abc0001' })
    @IsOptional()
    @IsString()
    assessmentId!: string;

    @ApiPropertyOptional({ description: 'Message', type: String, example: 'Message exemple' })
    @IsOptional()
    @IsString()
    message?: string;

    @ApiPropertyOptional({ description: 'Max questions', type: Number, example: 1 })
    @IsOptional()
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
}
