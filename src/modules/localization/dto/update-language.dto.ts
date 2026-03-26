import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateLanguageDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    nativeName?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
