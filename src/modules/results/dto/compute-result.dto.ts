import { IsObject, IsOptional, IsString } from 'class-validator';

export class ComputeResultDto {
    @IsString()
    sessionToken!: string;

    @IsOptional()
    @IsString()
    assessmentId?: string;

    @IsOptional()
    @IsObject()
    subjectiveRanking?: Record<string, number>;
}
