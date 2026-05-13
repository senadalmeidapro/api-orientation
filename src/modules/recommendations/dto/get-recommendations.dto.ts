import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CareerCategory } from '@prisma/client';
import { ApiHideProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { toBoolean } from '../../auth/dto/transforms';

type GeoCoordinates = {
  latitude?: number;
  longitude?: number;
};

export class GetRecommendationsDto {
  @ApiHideProperty()
  @IsOptional()
  @IsString()
  sessionToken?: string;

  @ApiPropertyOptional({ description: 'Assessment id', type: String, example: 'clx123abc0001' })
  @IsOptional()
  @IsString()
  assessmentId?: string;

  @ApiPropertyOptional({ description: 'Limit', type: Number, example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Category',
    enum: CareerCategory,
    example: Object.values(CareerCategory)[0],
  })
  @IsOptional()
  @IsEnum(CareerCategory)
  category?: CareerCategory;

  @ApiPropertyOptional({ description: 'Force', type: Boolean, example: true })
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  force?: boolean;

  @ApiPropertyOptional({ description: 'Advanced', type: Boolean, example: true })
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  advanced?: boolean;

  @ApiPropertyOptional({ description: 'Latitude', type: Number, example: 1 })
  @ValidateIf((o: GeoCoordinates) => o.latitude !== undefined || o.longitude !== undefined)
  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude', type: Number, example: 1 })
  @ValidateIf((o: GeoCoordinates) => o.latitude !== undefined || o.longitude !== undefined)
  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ description: 'Radius km', type: Number, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(500)
  radiusKm?: number;
}
