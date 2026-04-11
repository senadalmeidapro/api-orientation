import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLinkDto {
    @Type(() => Number)
    @IsInt()
    categoryId!: number;

    @IsString()
    title!: string;

    @IsOptional()
    @IsString()
    url?: string;

    @IsOptional()
    @IsString()
    note?: string;
}
