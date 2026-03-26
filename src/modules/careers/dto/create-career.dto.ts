import { ArrayNotEmpty, IsArray, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CareerCategory, RiasecType } from '@prisma/client';

export class CreateCareerDto {
    @IsString()
    name!: string;

    @IsString()
    description!: string;

    @IsOptional()
    @IsString()
    summary?: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsEnum(RiasecType, { each: true })
    riasecCodes!: RiasecType[];

    @IsOptional()
    @IsEnum(CareerCategory)
    category?: CareerCategory;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    localDemand?: number;

    @IsOptional()
    @IsString()
    formationLevel?: string;
}
