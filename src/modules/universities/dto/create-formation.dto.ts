import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateFormationDto {
    @IsString()
    title!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    duration?: string;

    @IsOptional()
    @IsString()
    degree?: string;

    @IsOptional()
    @IsString()
    field?: string;

    @IsNumber()
    universityId!: number;
}
