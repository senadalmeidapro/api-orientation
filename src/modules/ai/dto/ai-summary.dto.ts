import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AiSummaryDto {
    @ApiProperty({ description: 'Session token', type: String, example: 'tok_sample_123456' })
    @IsString()
    sessionToken!: string;

    @ApiPropertyOptional({ description: 'Assessment id', type: String, example: 'clx123abc0001' })
    @IsOptional()
    @IsString()
    assessmentId?: string;

    @ApiPropertyOptional({ description: 'Limit', type: Number, example: 20 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(12)
    limit?: number;
}
