import { Transform } from 'class-transformer';
import { IsHexadecimal, IsNotEmpty, IsString, Length } from 'class-validator';
import { ResetPasswordDto } from './reset-password.dto';
import { trimString } from './transforms';

export class ResetPasswordConfirmDto extends ResetPasswordDto {
    @Transform(({ value }) => trimString(value))
    @IsString()
    @IsNotEmpty()
    @IsHexadecimal()
    @Length(64, 64)
    token!: string;
}
