import { IsOptional, IsString } from 'class-validator';

export class UpdateLinkCategoryDto {
    @IsOptional()
    @IsString()
    name?: string;
}
