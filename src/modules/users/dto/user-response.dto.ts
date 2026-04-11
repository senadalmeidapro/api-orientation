import { UserRole, UserStatus } from '@prisma/client';

export class UserResponseDto {
    readonly id!: string;
    readonly email!: string | null;
    readonly first_name!: string | null;
    readonly last_name!: string | null;
    readonly display_name!: string | null;
    readonly bio!: string | null;
    readonly role!: UserRole;
    readonly status!: UserStatus;
    readonly email_verified_at!: Date | null;
    readonly last_login_at!: Date | null;
    readonly created_at!: Date;
    readonly updated_at!: Date;

    constructor(data: UserResponseDto) {
        Object.assign(this, data);
    }
}
