import { IsEnum, IsInt, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { InteractionEntityType, InteractionEventType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateInteractionDto {
    @IsString()
    sessionToken!: string;

    @IsOptional()
    @IsString()
    assessmentId?: string;

    @IsEnum(InteractionEventType)
    type!: InteractionEventType;

    @IsEnum(InteractionEntityType)
    entityType!: InteractionEntityType;

    @Type(() => Number)
    @IsInt()
    entityId!: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    value?: number;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, unknown>;
}
