import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { UserStatus } from '@prisma/client';
import { trimString } from './transforms';

export class UpdateUserDto {
    @IsOptional()
    @Transform(({ value }) => trimString(value))
    @IsString()
    @MaxLength(150)
    displayName?: string;

    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;

    @IsOptional()
    @Transform(({ value }) => trimString(value))
    @IsString()
    @MaxLength(2000)
    bio?: string;
}
