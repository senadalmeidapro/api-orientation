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
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ description: 'Email', type: String, example: 'user@example.com' })
    @Transform(({ value }) => trimLowercase(value))
    @IsEmail()
    @MaxLength(254)
    @IsNotEmpty()
    email!: string;

    @ApiProperty({ description: 'First name', type: String, example: 'John Doe' })
    @Transform(({ value }) => trimString(value))
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    @IsNotEmpty()
    firstName!: string;

    @ApiProperty({ description: 'Last name', type: String, example: 'John Doe' })
    @Transform(({ value }) => trimString(value))
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    @IsNotEmpty()
    lastName!: string;

    @ApiProperty({ description: 'Password', type: String, example: 'Str0ngP@ssw0rd!' })
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

    @ApiProperty({ description: 'Accept terms', type: Object, example: {} })
    @Transform(({ value }) => toBoolean(value))
    @IsBoolean()
    @Equals(true, { message: 'Terms must be accepted' })
    acceptTerms!: true;
}
