import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AiChatDto {
    @ApiProperty({ description: 'Session token', type: String, example: 'tok_sample_123456' })
    @IsString()
    sessionToken!: string;

    @ApiPropertyOptional({ description: 'Assessment id', type: String, example: 'clx123abc0001' })
    @IsOptional()
    @IsString()
    assessmentId?: string;

    @ApiProperty({ description: 'Message', type: String, example: 'Message exemple' })
    @IsString()
    @MaxLength(800)
    message!: string;
}
