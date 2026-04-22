import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const currentUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx
            .switchToHttp()
            .getRequest<Request & { user?: Record<string, unknown> }>();
        const user = request.user;

        return data ? user?.[data] : user;
    },
);
