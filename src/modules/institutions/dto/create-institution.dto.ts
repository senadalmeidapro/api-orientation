import { IsBoolean, IsObject, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateInstitutionDto {
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    acronym?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsString()
    department?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsUrl()
    website?: string;

    @IsOptional()
    @IsObject()
    programs?: Record<string, any>;

    @IsOptional()
    @IsUrl()
    logoUrl?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
