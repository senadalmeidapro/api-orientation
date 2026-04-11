import { IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { FeedbackType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateFeedbackDto {
    @IsString()
    sessionToken!: string;

    @IsOptional()
    @IsString()
    assessmentId?: string;

    @IsOptional()
    @IsString()
    recommendationId?: string;

    @IsEnum(FeedbackType)
    type!: FeedbackType;

    @Type(() => Number)
    @IsNumber()
    value!: number;

    @IsOptional()
    @IsObject()
    context?: Record<string, unknown>;
}
