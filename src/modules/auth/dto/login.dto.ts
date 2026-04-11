import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { trimLowercase } from './transforms';

export class LoginDto {
    @Transform(({ value }) => trimLowercase(value))
    @IsEmail()
    @MaxLength(254)
    @IsNotEmpty()
    email!: string;

    @IsString()
    @MinLength(8)
    @MaxLength(72)
    @IsNotEmpty()
    password!: string;
}
