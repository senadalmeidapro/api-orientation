import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLinkDto {
    @ApiPropertyOptional({ description: 'Category id', type: Number, example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    categoryId?: number;

    @ApiPropertyOptional({ description: 'Title', type: String, example: 'Titre exemple' })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({ description: 'Url', type: String, example: 'https://example.com' })
    @IsOptional()
    @IsString()
    url?: string;

    @ApiPropertyOptional({ description: 'Note', type: String, example: 'value' })
    @IsOptional()
    @IsString()
    note?: string;
}
