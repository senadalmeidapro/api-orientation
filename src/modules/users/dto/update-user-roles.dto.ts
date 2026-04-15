import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRolesDto {
    @ApiProperty({ description: 'Roles', type: [Object], example: [{}] })
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(1)
    @ArrayUnique()
    @IsEnum(UserRole, { each: true })
    roles!: UserRole[];
}
