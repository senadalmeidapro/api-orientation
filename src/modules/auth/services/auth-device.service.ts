import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Request } from 'express';
import { UAParser } from 'ua-parser-js';

export type AuthClientDeviceInfo = {
    deviceId: string;
    deviceType: string;
    browser: string | null;
    browserVersion: string | null;
    os: string | null;
    osVersion: string | null;
    ipAddress: string | null;
    userAgent: string | null;
};

@Injectable()
export class AuthDeviceService {
    getClientIp(request?: Request): string | null {
        if (!request) return null;

        const forwarded = request.headers['x-forwarded-for'];
        const realIp = request.headers['x-real-ip'];
        const raw =
            (Array.isArray(forwarded) ? forwarded[0] : forwarded) ||
            (Array.isArray(realIp) ? realIp[0] : realIp) ||
            request.ip ||
            request.connection?.remoteAddress ||
            request.socket?.remoteAddress ||
            null;

        if (!raw) return null;
        if (typeof raw !== 'string') return String(raw);
        const first = raw.split(',')[0]?.trim();
        return first ? this.normalizeIp(first) : null;
    }

    getClientUserAgent(request?: Request): string | null {
        if (!request) return null;
        const agent = request.headers['user-agent'];
        if (!agent) return null;
        return Array.isArray(agent) ? agent.join(', ') : agent;
    }

    extractDeviceInfo(request?: Request): AuthClientDeviceInfo | null {
        if (!request) return null;

        const userAgent = this.getClientUserAgent(request);
        const headerDeviceId = request.headers['x-device-id'];
        const deviceId =
            typeof headerDeviceId === 'string' && headerDeviceId.trim().length > 0
                ? headerDeviceId.trim()
                : randomUUID();

        const parser = new UAParser(userAgent || undefined);
        const result = parser.getResult();

        return {
            deviceId,
            deviceType: this.mapDeviceType(result.device?.type),
            browser: result.browser?.name ?? null,
            browserVersion: result.browser?.version ?? null,
            os: result.os?.name ?? null,
            osVersion: result.os?.version ?? null,
            ipAddress: this.getClientIp(request),
            userAgent,
        };
    }

    cleanMetadata(deviceInfo: AuthClientDeviceInfo): any {
        // Keeps only relevant information for storage in Prisma
        return {
            device_id: deviceInfo.deviceId,
            device_type: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            browser_version: deviceInfo.browserVersion,
            os: deviceInfo.os,
            os_version: deviceInfo.osVersion,
        };
    }

    private normalizeIp(ip: string): string {
        if (ip.startsWith('::ffff:')) {
            return ip.replace('::ffff:', '');
        }
        return ip;
    }

    private mapDeviceType(deviceType?: string): string {
        if (!deviceType) return 'desktop';

        switch (deviceType.toLowerCase()) {
            case 'mobile':
                return 'mobile';
            case 'tablet':
                return 'tablet';
            case 'smarttv':
                return 'tv';
            case 'wearable':
                return 'wearable';
            case 'embedded':
                return 'embedded';
            default:
                return 'desktop';
        }
    }
}
