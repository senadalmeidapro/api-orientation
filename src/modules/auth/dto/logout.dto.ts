import { Transform } from 'class-transformer';
import { IsJWT, IsNotEmpty, IsString } from 'class-validator';
import { trimString } from './transforms';

export class LogoutDto {
    @Transform(({ value }) => trimString(value))
    @IsString()
    @IsJWT()
    @IsNotEmpty()
    refreshToken!: string;
}
