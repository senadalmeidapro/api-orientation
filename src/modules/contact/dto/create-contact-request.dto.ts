import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateContactRequestDto {
    @IsString()
    name!: string;

    @IsEmail()
    email!: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsString()
    requestType!: string;

    @IsString()
    message!: string;

    @IsOptional()
    @IsString()
    preferredDate?: string;

    @IsOptional()
    @IsString()
    preferredTime?: string;
}
