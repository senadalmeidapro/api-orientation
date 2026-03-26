import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OutcomeStatus } from '@prisma/client';

export class ListOutcomesDto {
    @IsOptional()
    @IsUUID()
    userId?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    careerId?: number;

    @IsOptional()
    @IsEnum(OutcomeStatus)
    status?: OutcomeStatus;

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
