import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {Role, ROLES_KEY} from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {
    }

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!roles || roles.length === 0) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) return false;

        if (roles.includes('admin')) return Boolean(user.isAdmin);

        const userRoles: string[] = Array.isArray(user.roles) ? user.roles : [];
        const normalized = userRoles.map((r) => String(r).toLowerCase());
        return roles.some((r) => normalized.includes(r));
    }
}
