import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
import { trimLowercase } from './transforms';
import { ApiProperty } from '@nestjs/swagger';

export class EmailDto {
  @ApiProperty({ description: 'Email', type: String, example: 'user@example.com' })
  @Transform(({ value }) => trimLowercase(value))
  @IsEmail()
  @MaxLength(254)
  @IsNotEmpty()
  email!: string;
}
