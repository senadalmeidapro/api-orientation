import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AiChatDto {
    @IsString()
    sessionToken!: string;

    @IsOptional()
    @IsString()
    assessmentId?: string;

    @IsString()
    @MaxLength(800)
    message!: string;
}
