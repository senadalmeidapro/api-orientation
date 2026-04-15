import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLinkDto {
    @ApiProperty({ description: 'Category id', type: Number, example: 1 })
    @Type(() => Number)
    @IsInt()
    categoryId!: number;

    @ApiProperty({ description: 'Title', type: String, example: 'Titre exemple' })
    @IsString()
    title!: string;

    @ApiPropertyOptional({ description: 'Url', type: String, example: 'https://example.com' })
    @IsOptional()
    @IsString()
    url?: string;

    @ApiPropertyOptional({ description: 'Note', type: String, example: 'value' })
    @IsOptional()
    @IsString()
    note?: string;
}
