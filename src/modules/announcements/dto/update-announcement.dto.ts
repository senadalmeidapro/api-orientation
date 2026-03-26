import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAnnouncementDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsString()
    excerpt?: string;

    @IsOptional()
    @IsEnum(['INFO', 'EVENT', 'ALERTE', 'PROMO'])
    type?: 'INFO' | 'EVENT' | 'ALERTE' | 'PROMO';

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
    @IsEnum(['ALL', 'STUDENTS', 'PARENTS', 'TEACHERS'])
    targetAudience?: 'ALL' | 'STUDENTS' | 'PARENTS' | 'TEACHERS';

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
