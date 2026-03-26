import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateAnnouncementTranslationDto {
    @IsString()
    languageCode!: string;

    @IsString()
    title!: string;

    @IsString()
    content!: string;

    @IsOptional()
    @IsString()
    excerpt?: string;

    @IsOptional()
    @IsUrl()
    audioUrl?: string;
}
