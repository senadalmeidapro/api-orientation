export type JwtTokenType = 'access' | 'refresh';

export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    type: JwtTokenType;
    iss: string;
    aud: string;
}

export interface SignedTokens {
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
}

export interface ClientDeviceInfo {
    deviceId: string;
    deviceType: 'desktop' | 'mobile' | 'tablet' | 'tv' | 'wearable' | 'embedded';
    browser: string | null;
    os: string | null;
    ipAddress: string | null;
    userAgent: string | null;
}
