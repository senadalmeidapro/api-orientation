import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPhase1QuestionsDto {
    @IsOptional()
    @IsString()
    sessionToken?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    testVersionId?: number;

    @IsOptional()
    @IsString()
    lang?: string;
}
