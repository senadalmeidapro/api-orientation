import { IsOptional, IsString } from 'class-validator';

export class CreateInstitutionTranslationDto {
    @IsString()
    languageCode!: string;

    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;
}
