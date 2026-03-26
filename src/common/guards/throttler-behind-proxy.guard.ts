import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
    override async getTracker(req: Record<string, any>): Promise<string> {
        const forwarded = req.headers['x-forwarded-for'];

        if (typeof forwarded === 'string' && forwarded.length > 0) {
            return forwarded.split(',')[0].trim();
        }

        return req.ip ?? req.connection?.remoteAddress ?? 'unknown';
    }
}
