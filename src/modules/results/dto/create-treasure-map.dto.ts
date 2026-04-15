import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTreasureMapDto {
    @ApiProperty({ description: 'Session token', type: String, example: 'tok_sample_123456' })
    @IsString()
    sessionToken!: string;

    @ApiPropertyOptional({ description: 'Assessment id', type: String, example: 'clx123abc0001' })
    @IsOptional()
    @IsString()
    assessmentId?: string;

    @ApiPropertyOptional({ description: 'Generate pdf', type: Boolean, example: true })
    @IsOptional()
    @IsBoolean()
    generatePdf?: boolean;
}
