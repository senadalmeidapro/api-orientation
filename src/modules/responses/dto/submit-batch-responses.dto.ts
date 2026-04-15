import {
    IsArray,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
    IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BatchResponseItemDto {
    @ApiProperty({ description: 'Question ID', example: 42 })
    @IsInt()
    questionId!: number;

    @ApiProperty({ description: 'Response value (0/1 for phase1, 1-3 for phase2)', example: 1 })
    @IsInt()
    responseValue!: number;

    @ApiPropertyOptional({ description: 'Time taken to answer in milliseconds', example: 5420 })
    @IsOptional()
    @IsInt()
    timeTakenMs?: number;

    @ApiPropertyOptional({ description: 'Number of times the answer was changed', example: 2 })
    @IsOptional()
    @IsInt()
    changeCount?: number;

    @ApiPropertyOptional({
        description: 'Additional metadata (timestamps, changes, etc.)',
        example: {
            timestamps: [1234567890, 1234568000],
            changes: [{ from: 0, to: 1, at: 1234567950 }],
        },
    })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}

export class SubmitBatchResponsesDto {
    @ApiProperty({ description: 'Session token' })
    @IsString()
    sessionToken!: string;

    @ApiProperty({ description: 'Assessment ID' })
    @IsUUID()
    assessmentId!: string;

    @ApiProperty({ description: 'Batch index being submitted' })
    @IsInt()
    batchIndex!: number;

    @ApiProperty({
        description: 'Array of responses for the batch',
        type: [BatchResponseItemDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BatchResponseItemDto)
    responses!: BatchResponseItemDto[];
}
