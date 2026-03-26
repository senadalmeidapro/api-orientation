import { IsEnum, IsInt, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { Departement } from '@prisma/client';

export class CreateSessionDto {
    @IsOptional()
    @IsUUID()
    userId?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    testVersionId?: number;

    @IsOptional()
    @IsObject()
    deviceInfo?: Record<string, unknown>;

    @IsOptional()
    @IsString()
    userAgent?: string;

    @IsOptional()
    @IsString()
    ipAddress?: string;

    @IsOptional()
    @IsEnum(Departement)
    department?: Departement;
}
