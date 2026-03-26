import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Departement, Gender } from '@prisma/client';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    birthDate?: string;

    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @IsOptional()
    @IsEnum(Departement)
    department?: Departement;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    school?: string;

    @IsOptional()
    @IsString()
    level?: string;

    @IsOptional()
    @IsString()
    preferredLanguage?: string;

    @IsOptional()
    @IsBoolean()
    acceptNotifications?: boolean;
}
