import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class Phase1ResponseItemDto {
    @Type(() => Number)
    @IsInt()
    questionId!: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(1)
    responseValue!: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    responseTimeMs?: number;
}
