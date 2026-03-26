import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateResourceTranslationDto {
    @IsString()
    languageCode!: string;

    @IsString()
    title!: string;

    @IsString()
    description!: string;

    @IsString()
    content!: string;

    @IsOptional()
    @IsUrl()
    audioUrl?: string;
}
