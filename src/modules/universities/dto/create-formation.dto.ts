import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateFormationDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  duration!: string;

  @IsOptional()
  @IsString()
  degree!: string;

  @IsOptional()
  @IsString()
  field?: string;

  @IsOptional()
  @IsNumber()
  costMin?: number;

  @IsOptional()
  @IsNumber()
  costMax?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  programs?: string[];

  @IsNumber()
  universityAcronym!: number;
}
