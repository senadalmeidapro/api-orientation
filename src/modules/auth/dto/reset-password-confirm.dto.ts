import { Transform } from 'class-transformer';
import { IsHexadecimal, IsNotEmpty, IsString, Length } from 'class-validator';
import { ResetPasswordDto } from './reset-password.dto';
import { trimString } from './transforms';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordConfirmDto extends ResetPasswordDto {
    @ApiProperty({ description: 'Token', type: String, example: 'tok_sample_123456' })
    @Transform(({ value }) => trimString(value))
    @IsString()
    @IsNotEmpty()
    @IsHexadecimal()
    @Length(64, 64)
    token!: string;
}
