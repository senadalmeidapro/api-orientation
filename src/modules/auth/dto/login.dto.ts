import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { trimLowercase } from './transforms';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ description: 'Email', type: String, example: 'user@example.com' })
    @Transform(({ value }) => trimLowercase(value))
    @IsEmail()
    @MaxLength(254)
    @IsNotEmpty()
    email!: string;

    @ApiProperty({ description: 'Password', type: String, example: 'Str0ngP@ssw0rd!' })
    @IsString()
    @MinLength(8)
    @MaxLength(72)
    @IsNotEmpty()
    password!: string;
}
