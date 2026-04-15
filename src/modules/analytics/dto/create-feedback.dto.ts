import { IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { FeedbackType } from '@prisma/client';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeedbackDto {
    @ApiProperty({ description: 'Session token', type: String, example: 'tok_sample_123456' })
    @IsString()
    sessionToken!: string;

    @ApiPropertyOptional({ description: 'Assessment id', type: String, example: 'clx123abc0001' })
    @IsOptional()
    @IsString()
    assessmentId?: string;

    @ApiPropertyOptional({
        description: 'Recommendation id',
        type: String,
        example: 'clx123abc0001',
    })
    @IsOptional()
    @IsString()
    recommendationId?: string;

    @ApiProperty({
        description: 'Type',
        enum: FeedbackType,
        example: Object.values(FeedbackType)[0],
    })
    @IsEnum(FeedbackType)
    type!: FeedbackType;

    @ApiProperty({ description: 'Value', type: Number, example: 1 })
    @Type(() => Number)
    @IsNumber()
    value!: number;

    @ApiPropertyOptional({ description: 'Context', type: Object, example: { key: 'value' } })
    @IsOptional()
    @IsObject()
    context?: Record<string, unknown>;
}
