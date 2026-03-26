import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class Phase2ResponseItemDto {
    @Type(() => Number)
    @IsInt()
    questionId!: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(3)
    responseValue!: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    responseTimeMs?: number;
}
