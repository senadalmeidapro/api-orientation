import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Label } from '@prisma/client';

export class UpdateAptitudeOptionDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    value?: number;

    @IsOptional()
    @IsEnum(Label)
    label?: Label;

    @IsOptional()
    @IsString()
    emoji?: string;

    @IsOptional()
    @IsString()
    colorCode?: string;
}
