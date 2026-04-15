import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLinkCategoryDto {
    @ApiProperty({ description: 'Name', type: String, example: 'John Doe' })
    @IsString()
    name!: string;
}
