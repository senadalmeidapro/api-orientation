import { Transform } from 'class-transformer';
import { IsHexadecimal, IsNotEmpty, IsString, Length } from 'class-validator';
import { trimString } from './transforms';
import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty({ description: 'Token', type: String, example: 'tok_sample_123456' })
  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @IsHexadecimal()
  @Length(64, 64)
  token!: string;
}
