import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetAssessmentDto {
    @ApiProperty({ description: 'Session token', type: String, example: 'tok_sample_123456' })
    @IsString()
    sessionToken!: string;
}
