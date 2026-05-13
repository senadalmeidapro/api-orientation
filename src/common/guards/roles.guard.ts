import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleLike, rolesKey } from '../decorators/roles.decorator';
import { isPublicKey } from '../decorators/public.decorator';
import type { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(isPublicKey, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<RoleLike[]>(rolesKey, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { roles?: RoleLike[]; role?: RoleLike } }>();
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
