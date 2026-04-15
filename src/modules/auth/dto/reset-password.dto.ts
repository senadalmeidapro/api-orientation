import { IsNotEmpty, IsString, IsStrongPassword, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty({ description: 'Old password', type: String, example: 'Str0ngP@ssw0rd!' })
    @IsString()
    @MinLength(8)
    @MaxLength(72)
    @IsNotEmpty()
    oldPassword!: string;

    @ApiProperty({ description: 'New password', type: String, example: 'Str0ngP@ssw0rd!' })
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
