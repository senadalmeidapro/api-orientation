import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateUserRolesDto {
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(1)
    @ArrayUnique()
    @IsEnum(UserRole, { each: true })
    roles!: UserRole[];
}
