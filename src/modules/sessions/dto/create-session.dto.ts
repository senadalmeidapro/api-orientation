import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSessionDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    testVersionId?: number;
}
