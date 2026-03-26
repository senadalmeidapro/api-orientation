import { IsArray, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CareerCategory, RiasecType } from '@prisma/client';

export class UpdateCareerDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    summary?: string;

    @IsOptional()
    @IsArray()
    @IsEnum(RiasecType, { each: true })
    riasecCodes?: RiasecType[];

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

    @IsOptional()
    @Type(() => Boolean)
    isActive?: boolean;
}
