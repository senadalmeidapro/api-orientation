import { IsString, IsOptional, IsArray, IsDateString, IsUrl, IsInt, Min } from 'class-validator';

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

  @IsArray()
  @IsString({ each: true })
  benefits!: string[];

  @IsArray()
  @IsString({ each: true })
  conditions!: string[];

  @IsString()
  level!: string;

  @IsOptional()
  @IsString()
  field?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsUrl()
  applicationUrl?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  universityIds?: number[];
}
