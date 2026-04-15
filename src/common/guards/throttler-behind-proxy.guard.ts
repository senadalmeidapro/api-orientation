import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
    override async getTracker(req: Record<string, any>): Promise<string> {
        if (Array.isArray(req.ips) && req.ips.length > 0) {
            return req.ips[0];
        }

        const forwardedFor = req.headers?.['x-forwarded-for'];
        const rawForwarded = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
        if (typeof rawForwarded === 'string' && rawForwarded.trim().length > 0) {
            const firstForwardedIp = rawForwarded.split(',')[0]?.trim();
            if (firstForwardedIp) return firstForwardedIp;
        }

        return req.ip ?? req.socket?.remoteAddress ?? req.connection?.remoteAddress ?? 'unknown';
    }
}
