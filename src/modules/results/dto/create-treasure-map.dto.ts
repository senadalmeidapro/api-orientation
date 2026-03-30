import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateTreasureMapDto {
    @IsString()
    sessionToken!: string;

    @IsOptional()
    @IsString()
    assessmentId?: string;

    @IsOptional()
    @IsBoolean()
    generatePdf?: boolean;
}
