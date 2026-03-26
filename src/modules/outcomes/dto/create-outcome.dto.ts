import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OutcomeStatus } from '@prisma/client';

export class CreateOutcomeDto {
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

    @Type(() => Number)
    @IsInt()
    @Min(0)
    delayToOutcome!: number;
}
