import { ArrayNotEmpty, IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateRolesDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    roles!: string[];

    @IsOptional()
    @IsBoolean()
    isAdmin?: boolean;
}
