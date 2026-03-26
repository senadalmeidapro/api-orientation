import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateTreasureMapDto {
    @IsString()
    sessionToken!: string;

    @IsOptional()
    @IsBoolean()
    generatePdf?: boolean;
}
