import { Transform } from 'class-transformer';
import { IsHexadecimal, IsNotEmpty, IsString, Length } from 'class-validator';
import { trimString } from './transforms';

export class TokenDto {
    @Transform(({ value }) => trimString(value))
    @IsString()
    @IsNotEmpty()
    @IsHexadecimal()
    @Length(64, 64)
    token!: string;
}
