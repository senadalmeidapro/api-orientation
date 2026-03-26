import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { AnnouncementType, TargetAudience } from '@prisma/client';

export class CreateAnnouncementDto {
    @IsString()
    title!: string;

    @IsString()
    content!: string;

    @IsOptional()
    @IsString()
    excerpt?: string;

    @IsEnum(AnnouncementType)
    type!: AnnouncementType;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    priority?: number;

    @IsOptional()
    @IsUrl()
    imageUrl?: string;

    @IsOptional()
    @IsUrl()
    linkUrl?: string;

    @IsOptional()
    @IsEnum(TargetAudience)
    targetAudience?: TargetAudience;

    @IsOptional()
    @IsString()
    startDate?: string;

    @IsOptional()
    @IsString()
    endDate?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsString()
    publishedAt?: string;
}
