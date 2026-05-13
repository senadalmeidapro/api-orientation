import type { UserRole } from '@prisma/client';

export type JwtTokenType = 'access' | 'refresh';

export interface JwtPayload {
  sub: string;
  email?: string | null;
  role: UserRole;
  type: 'access' | 'refresh';
  issuer?: string;
  audience?: string | string[];
  exp?: number;
  iat?: number;
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

type Unit =
  | 'Years'
  | 'Year'
  | 'Yrs'
  | 'Yr'
  | 'Y'
  | 'Weeks'
  | 'Week'
  | 'W'
  | 'Days'
  | 'Day'
  | 'D'
  | 'Hours'
  | 'Hour'
  | 'Hrs'
  | 'Hr'
  | 'H'
  | 'Minutes'
  | 'Minute'
  | 'Mins'
  | 'Min'
  | 'M'
  | 'Seconds'
  | 'Second'
  | 'Secs'
  | 'Sec'
  | 's'
  | 'Milliseconds'
  | 'Millisecond'
  | 'Msecs'
  | 'Msec'
  | 'Ms';

type UnitAnyCase = Unit | Uppercase<Unit> | Lowercase<Unit>;

type StringValue = `${number}` | `${number}${UnitAnyCase}` | `${number} ${UnitAnyCase}`;
