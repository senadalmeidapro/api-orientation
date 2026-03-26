import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ContactSatus } from '@prisma/client';

export class UpdateContactRequestDto {
    @IsOptional()
    @IsEnum(ContactSatus)
    status?: ContactSatus;

    @IsOptional()
    @IsString()
    assignedTo?: string;

    @IsOptional()
    @IsString()
    response?: string;
}
