import { Transform } from 'class-transformer';
import { IsJWT, IsNotEmpty, IsString } from 'class-validator';
import { trimString } from './transforms';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({ description: 'Refresh token', type: String, example: 'tok_sample_123456' })
  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsJWT()
  @IsNotEmpty()
  refreshToken!: string;
}
