import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListLinksDto {
    @ApiPropertyOptional({ description: 'Category id', type: Number, example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    categoryId?: number;
}
