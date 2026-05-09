import {
    IsBoolean,
    IsEmail,
    IsOptional,
    IsString,
    IsNumber,
    IsArray,
    IsUrl,
    MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUniversityDto {
    @ApiProperty({
        description: 'University name',
        example: 'University of Abomey-Calavi',
    })
    @IsString()
    @MinLength(3)
    name!: string;

    @ApiPropertyOptional({
        description: 'Acronym of the university',
        example: 'UAC',
    })
    @IsString()
    acronym!: string;

    @ApiPropertyOptional({
        description: 'Detailed description of the university',
        example: 'One of the largest public universities in Benin.',
    })
    @IsString()
    @MinLength(10)
    description!: string;

    @ApiPropertyOptional({
        description: 'Department or region',
        example: 'Atlantique',
    })
    @IsOptional()
    @IsString()
    department?: string;

    @ApiPropertyOptional({
        description: 'City where the university is located',
        example: 'Abomey-Calavi',
    })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({
        description: 'Full physical address',
        example: '01 BP 526 Cotonou',
    })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({
        description: 'Latitude coordinate',
        example: 6.42,
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    latitude?: number;

    @ApiPropertyOptional({
        description: 'Longitude coordinate',
        example: 2.34,
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    longitude?: number;

    @ApiPropertyOptional({
        description: 'Phone number',
        example: '+22912345678',
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({
        description: 'Contact email address',
        example: 'contact@university.bj',
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({
        description: 'Official website URL',
        example: 'https://www.university.bj',
    })
    @IsUrl()
    website!: string;

    @ApiPropertyOptional({
        description: 'Geographical location (textual)',
        example: 'Abomey-Calavi, Benin',
    })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiPropertyOptional({
        description: 'URL of the cover image',
        example: 'https://example.com/cover.jpg',
    })
    @IsOptional()
    @IsUrl()
    coverUrl?: string;

    @ApiPropertyOptional({
        description: 'Array of media URLs (images, videos)',
        example: ['https://example.com/img1.jpg', 'https://example.com/video.mp4'],
    })
    @IsOptional()
    @IsArray()
    @IsUrl({}, { each: true })
    mediaUrls?: string[];

    @ApiPropertyOptional({
        description: 'Programs offered by the university (flexible structure)',
        example: { engineering: ['Computer Science', 'Civil Engineering'] },
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    formationUrls!: string[];

    @ApiPropertyOptional({
        description: 'Logo URL',
        example: 'https://example.com/logo.png',
    })
    @IsOptional()
    @IsUrl()
    logoUrl?: string;

    @ApiPropertyOptional({
        description: 'Indicates whether the university is active',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
