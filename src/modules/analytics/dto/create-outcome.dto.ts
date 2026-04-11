import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { OutcomeStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateOutcomeDto {
    @IsString()
    sessionToken!: string;

    @IsOptional()
    @IsString()
    assessmentId?: string;

    @Type(() => Number)
    @IsInt()
    careerId!: number;

    @IsEnum(OutcomeStatus)
    status!: OutcomeStatus;

    @IsString()
    sector!: string;

    @IsOptional()
    @IsString()
    salaryRange?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    delayToOutcome!: number;
}
