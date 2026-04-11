import { IsString } from 'class-validator';

export class CreateLinkCategoryDto {
    @IsString()
    name!: string;
}
