import { IsArray, IsBoolean, IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResourceDto {
  @ApiProperty({ description: 'Title', type: String, example: 'Titre exemple' })
  @IsString()
  title!: string;

  @ApiProperty({ description: 'Description', type: String, example: 'Description exemple' })
  @IsString()
  description!: string;

  @ApiProperty({ description: 'Content', type: String, example: 'value' })
  @IsString()
  content!: string;

  @ApiProperty({ description: 'Content type', type: String, example: 'value' })
  @IsString()
  contentType!: string;

  @ApiPropertyOptional({
    description: 'Thumbnail url',
    type: String,
    example: 'https://example.com',
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Media url', type: String, example: 'https://example.com' })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional({
    description: 'Category',
    type: String,
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Tags', type: [String], example: ['value-1', 'value-2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Author', type: String, example: 'value' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ description: 'Is published', type: Boolean, example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Published at',
    type: String,
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @ApiPropertyOptional({ description: 'Career ids', type: [Number], example: [1, 2] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  careerIds?: number[];
}
