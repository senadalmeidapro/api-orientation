import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { FeedbackType } from '@prisma/client';

export class ListFeedbackDto {
    @IsOptional()
    @IsUUID()
    userId?: string;

    @IsOptional()
    @IsUUID()
    sessionId?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    recommendationId?: number;

    @IsOptional()
    @IsEnum(FeedbackType)
    type?: FeedbackType;

    @IsOptional()
    @IsString()
    from?: string;

    @IsOptional()
    @IsString()
    to?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;
}
