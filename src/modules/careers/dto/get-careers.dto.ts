import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CareerCategory } from '@prisma/client';

export class GetCareersDto {
    @IsOptional()
    @IsEnum(CareerCategory)
    category?: CareerCategory;

    @IsOptional()
    @IsString()
    q?: string;
}
