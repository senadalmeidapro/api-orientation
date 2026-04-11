import { IsNotEmpty, IsString, IsStrongPassword, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @IsString()
    @MinLength(8)
    @MaxLength(72)
    @IsNotEmpty()
    oldPassword!: string;

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
    newPassword!: string;
}
