import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLinkCategoryDto {
    @ApiPropertyOptional({ description: 'Name', type: String, example: 'John Doe' })
    @IsOptional()
    @IsString()
    name?: string;
}
