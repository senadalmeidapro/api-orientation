import { IsString, IsOptional, IsArray, IsDateString, IsNumber } from 'class-validator';

export class CreateScholarshipDto {
    @IsString()
    title!: string;

    @IsString()
    description!: string;

    @IsString()
    provider!: string;

    @IsOptional()
    @IsString()
    amount?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    benefits?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    conditions?: string[];

    @IsString()
    level!: string;

    @IsOptional()
    @IsString()
    field?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    applicationUrl?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    universityIds?: number[];
}
