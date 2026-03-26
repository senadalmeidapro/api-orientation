import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { RiasecType } from '@prisma/client';

export class CreateRiasecTypeDto {
    @IsEnum(RiasecType)
    id!: RiasecType;

    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    slogan?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    colorHex?: string;

    @IsOptional()
    @IsString()
    iconUrl?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    displayOrder?: number;
}
