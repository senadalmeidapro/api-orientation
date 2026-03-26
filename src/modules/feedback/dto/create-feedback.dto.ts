import { IsEnum, IsInt, IsNumber, IsObject, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { FeedbackType } from '@prisma/client';

export class CreateFeedbackDto {
    @IsOptional()
    @IsUUID()
    sessionId?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    recommendationId?: number;

    @IsEnum(FeedbackType)
    type!: FeedbackType;

    @Type(() => Number)
    @IsNumber()
    value!: number;

    @IsOptional()
    @IsObject()
    context?: Record<string, any>;
}
