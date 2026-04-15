import { UserRole, UserStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
    @ApiProperty({ description: 'Id', type: String, example: 'clx123abc0001' })
    readonly id!: string;
    @ApiProperty({ description: 'Email', type: Object, example: 'value' })
    readonly email!: string | null;
    @ApiProperty({ description: 'First name', type: Object, example: 'value' })
    readonly first_name!: string | null;
    @ApiProperty({ description: 'Last name', type: Object, example: 'value' })
    readonly last_name!: string | null;
    @ApiProperty({ description: 'Display name', type: Object, example: 'value' })
    readonly display_name!: string | null;
    @ApiProperty({ description: 'Bio', type: Object, example: 'value' })
    readonly bio!: string | null;
    @ApiProperty({ description: 'Role', enum: UserRole, example: Object.values(UserRole)[0] })
    readonly role!: UserRole;
    @ApiProperty({ description: 'Status', enum: UserStatus, example: Object.values(UserStatus)[0] })
    readonly status!: UserStatus;
    @ApiProperty({ description: 'Email verified at', type: Object, example: 'value' })
    readonly email_verified_at!: Date | null;
    @ApiProperty({ description: 'Last login at', type: Object, example: 'value' })
    readonly last_login_at!: Date | null;
    @ApiProperty({ description: 'Created at', type: String, example: '2026-01-01T00:00:00.000Z' })
    readonly created_at!: Date;
    @ApiProperty({ description: 'Updated at', type: String, example: '2026-01-01T00:00:00.000Z' })
    readonly updated_at!: Date;

    constructor(data: UserResponseDto) {
        Object.assign(this, data);
    }
}
