import { IsString } from 'class-validator';

export class GetAssessmentDto {
    @IsString()
    sessionToken!: string;
}
