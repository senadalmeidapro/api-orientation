import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@prisma/client';

export const rolesKey = 'roles';
export type RoleLike = UserRole;
export const roles = (...roles: RoleLike[]) => SetMetadata(rolesKey, roles);
