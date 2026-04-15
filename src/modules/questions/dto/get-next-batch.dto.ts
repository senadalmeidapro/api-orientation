import { IsOptional, IsInt, Min, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetNextBatchDto {
    @ApiProperty({
        description: 'Language code',
        example: 'fr',
    })
    @IsString()
    lang!: string;

    @ApiProperty({
        description: 'Session token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    @IsString()
    sessionToken!: string;

    @ApiPropertyOptional({
        description: 'Assessment ID (optional if only one active assessment)',
        example: 'clu123456789',
    })
    @IsOptional()
    @IsUUID()
    assessmentId?: string;

    @ApiPropertyOptional({
        description: 'Batch size override (default: from assessment config)',
        example: 5,
        minimum: 1,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    batchSize?: number;
}
