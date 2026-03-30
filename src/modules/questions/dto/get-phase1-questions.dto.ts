import { IsOptional, IsString } from 'class-validator';

export class GetPhase1QuestionsDto {
    @IsString()
    sessionToken!: string;

    @IsOptional()
    @IsString()
    lang?: string;
}
