import { IsOptional, IsString } from 'class-validator';

export class ListAnnouncementsDto {
    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsString()
    targetAudience?: string;

    @IsOptional()
    @IsString()
    lang?: string;

    @IsOptional()
    @IsString()
    from?: string;

    @IsOptional()
    @IsString()
    to?: string;
}
