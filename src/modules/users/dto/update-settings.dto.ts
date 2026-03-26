import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { FontSize, Theme } from '@prisma/client';

export class UpdateSettingsDto {
    @IsOptional()
    @IsEnum(Theme)
    theme?: Theme;

    @IsOptional()
    @IsEnum(FontSize)
    fontSize?: FontSize;

    @IsOptional()
    @IsBoolean()
    shareResults?: boolean;
}
