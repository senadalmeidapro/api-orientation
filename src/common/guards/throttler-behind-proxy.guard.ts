import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
    override getTracker(req: Request): Promise<string> {
        if (Array.isArray(req.ips) && req.ips.length > 0) {
            return Promise.resolve(req.ips[0] ?? 'unknown');
        }

        const forwardedFor = req.headers?.['x-forwarded-for'];
        const rawForwarded = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
        if (typeof rawForwarded === 'string' && rawForwarded.trim().length > 0) {
            const firstForwardedIp = rawForwarded.split(',')[0]?.trim();
            if (firstForwardedIp) return Promise.resolve(firstForwardedIp);
        }

        return Promise.resolve(req.ip ?? req.socket?.remoteAddress ?? 'unknown');
    }
}
