import { IsString, IsOptional, IsArray, IsUrl, MinLength, IsEmail } from 'class-validator';

export class CreateUniversityDto {
    @IsString()
    @MinLength(3)
    name!: string;

    @IsOptional()
    @IsString()
    acronym?: string;

    @IsOptional()
    @IsString()
    @MinLength(10)
    description?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsUrl()
    website?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsUrl()
    coverUrl?: string;

    @IsOptional()
    @IsArray()
    @IsUrl({}, { each: true })
    mediaUrls?: string[];
}
