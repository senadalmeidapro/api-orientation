import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { Request } from 'express';
import { AuthTokenService } from '../services/auth-token.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(
        private readonly reflector: Reflector,
        private readonly token: AuthTokenService,
    ) {
        super();
    }

    override async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) return true;

        const canActivate = await super.canActivate(context);
        if (!canActivate) return false;

        const request = this.getRequest(context);
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        const isBlacklisted = await this.token.isBlacklisted(token);
        if (isBlacklisted) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }

    override getRequest(context: ExecutionContext): Request {
        return context.switchToHttp().getRequest<Request>();
    }

    override handleRequest<TUser = unknown>(err: unknown, user: TUser, _info?: unknown): TUser {
        if (err || !user) {
            throw err || new UnauthorizedException('Invalid or expired token');
        }
        return user;
    }
}
