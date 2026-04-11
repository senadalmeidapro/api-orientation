import { Transform } from 'class-transformer';
import {
    Equals,
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsString,
    IsStrongPassword,
    MaxLength,
    MinLength,
} from 'class-validator';
import { toBoolean, trimLowercase, trimString } from './transforms';

export class RegisterDto {
    @Transform(({ value }) => trimLowercase(value))
    @IsEmail()
    @MaxLength(254)
    @IsNotEmpty()
    email!: string;

    @Transform(({ value }) => trimString(value))
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    @IsNotEmpty()
    firstName!: string;

    @Transform(({ value }) => trimString(value))
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    @IsNotEmpty()
    lastName!: string;

    @IsString()
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
    @MaxLength(72)
    @IsNotEmpty()
    password!: string;

    @Transform(({ value }) => toBoolean(value))
    @IsBoolean()
    @Equals(true, { message: 'Terms must be accepted' })
    acceptTerms!: true;
}
