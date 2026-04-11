import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export type RoleLike = UserRole | string;
export const Roles = (...roles: RoleLike[]) => SetMetadata(ROLES_KEY, roles);
