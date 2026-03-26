import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateLanguageDto {
    @IsString()
    code!: string;

    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    nativeName?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
