import { IsString } from 'class-validator';

export class AbandonAssessmentDto {
    @IsString()
    sessionToken!: string;
}
