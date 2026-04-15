import { IsBoolean, IsEmail, IsObject, IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTrainingCenterDto {
    @ApiProperty({ description: 'Name', type: String, example: 'John Doe' })
    @IsString()
    name!: string;

    @ApiPropertyOptional({ description: 'Acronym', type: String, example: 'value' })
    @IsOptional()
    @IsString()
    acronym?: string;

    @ApiPropertyOptional({
        description: 'Description',
        type: String,
        example: 'Description exemple',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ description: 'Type', type: String, example: 'value' })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiPropertyOptional({ description: 'Department', type: String, example: 'value' })
    @IsOptional()
    @IsString()
    department?: string;

    @ApiPropertyOptional({ description: 'City', type: String, example: 'value' })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({ description: 'Address', type: String, example: 'value' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({ description: 'Latitude', type: Number, example: 1 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    latitude?: number;

    @ApiPropertyOptional({ description: 'Longitude', type: Number, example: 1 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    longitude?: number;

    @ApiPropertyOptional({ description: 'Phone', type: String, example: '+33123456789' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ description: 'Email', type: String, example: 'user@example.com' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ description: 'Website', type: String, example: 'value' })
    @IsOptional()
    @IsString()
    website?: string;

    @ApiPropertyOptional({ description: 'Programs', type: Object, example: { key: 'value' } })
    @IsOptional()
    @IsObject()
    programs?: Record<string, unknown>;

    @ApiPropertyOptional({ description: 'Logo url', type: String, example: 'https://example.com' })
    @IsOptional()
    @IsString()
    logoUrl?: string;

    @ApiPropertyOptional({ description: 'Is active', type: Boolean, example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
