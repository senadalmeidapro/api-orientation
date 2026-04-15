import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleLike, ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) return true;

        const requiredRoles = this.reflector.getAllAndOverride<RoleLike[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0) return true;

        const request = context.switchToHttp().getRequest();
        const user = request?.user as { roles?: RoleLike[]; role?: RoleLike } | undefined;
        if (!user) {
            throw new UnauthorizedException('Acces refuse');
        }

        const userRoles =
            Array.isArray(user.roles) && user.roles.length > 0
                ? user.roles
                : user.role
                  ? [user.role]
                  : [];
        if (userRoles.length === 0) {
            throw new ForbiddenException('Acces refuse');
        }

        return requiredRoles.some((role) => userRoles.includes(role));
    }
}
