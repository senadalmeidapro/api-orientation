import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';

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
  @IsObject()
  programs?: Record<string, unknown>;

  @IsNumber()
  universityAcronym!: number;
}
