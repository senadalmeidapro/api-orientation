import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SessionTokenParam {
  @ApiProperty({ description: 'Session token', type: String, example: 'tok_sample_123456' })
  @IsString()
  sessionToken!: string;
}
