import type { AuthProvider, UserRole, UserStatus } from '@prisma/client';

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

export interface NormalizedOAuthProfile {
  providerAccountId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

// ========== BASIC INTERFACES ==========

export interface RegisterResponse {
  userId: string;
  email: string;
  username: string;
  message: string;
  requiresEmailVerification: boolean;
}

export interface LoginResponse {
  userId: string;
  email: string;
  username: string;
  tempToken?: string;
  accessToken?: string;
  refreshToken?: string;
  sessionToken?: string;
  user?: UserProfile;
  isNewUser?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  sessionToken: string;
  expiresIn: number;
}

// ========== USER PROFILE INTERFACES ==========

export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  authAccounts: AuthAccountInfo[];
}

export interface AuthAccountInfo {
  id: string;
  provider: AuthProvider;
  providerEmail: string;
  createdAt: Date;
  lastUsedAt: Date | null;
}

// ========== SESSION INTERFACES ==========

export interface SessionInfo {
  id: string;
  deviceType: string | null;
  deviceBrowser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  ipAddress: string | null;
  lastActivityAt: Date;
  createdAt: Date;
  isCurrent: boolean;
}

export interface SessionDetails {
  id: string;
  deviceId: string | null;
  deviceType: string | null;
  deviceOs: string | null;
  deviceBrowser: string | null;
  deviceBrowserVersion: string | null;
  ipAddress: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  userAgent: string | null;
  isActive: boolean;
  isCurrent: boolean;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
}

export interface DeviceInfo {
  deviceType: string[];
  deviceName: string;
  os: string | undefined;
  osVersion: string | undefined;
  browser: string | undefined;
  browserVersion: string | undefined;
  userAgent: string | undefined;
  ipAddress: string;
  forwardedFor: string[];
}

// ========== ACCOUNT STATS INTERFACES ==========

export interface AccountStats {
  user: {
    id: string;
    email: string;
    username: string;
    createdAt: Date;
    lastLoginAt: Date | null;
  };
  stats: {
    projectCount: number;
    sessionCount: number;
    unreadNotifications: number;
    storageUsed: number;
  };
  recentActivity: UserActivity[];
}

export interface UserActivity {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  data: unknown;
  recordedAt: Date;
}

// ========== PAGINATION INTERFACES ==========

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ========== CONFIG INTERFACES ==========

export interface AuthConfig {
  saltRounds: number;
  passwordMinLength: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  emailVerificationExpiry: number;
  passwordResetExpiry: number;
  sessionExpiryDays: number;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
  mfaTempTokenExpiry: string;
  backupCodeCount: number;
  recoveryCodeCount: number;
}

// ========== SERVICE INTERFACES ==========

export interface EmailService {
  sendVerificationEmail(data: VerificationEmailData): Promise<void>;
  sendWelcomeEmail(data: WelcomeEmailData): Promise<void>;
  sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void>;
  sendPasswordResetConfirmation(data: PasswordResetConfirmationData): Promise<void>;
  sendEmailUpdateVerification(data: EmailUpdateVerificationData): Promise<void>;
  sendAccountDeletionEmail(data: AccountDeletionEmailData): Promise<void>;
  sendMFACodeEmail(data: MFACodeEmailData): Promise<void>;
}

export interface VerificationEmailData {
  to: string;
  firstName?: string | null;
  token: string;
  userId: string;
}

export interface WelcomeEmailData {
  to: string;
  firstName?: string | null;
  userId: string;
  temporaryPassword?: string;
}

export interface PasswordResetEmailData {
  to: string;
  firstName?: string | null;
  token: string;
  userId: string;
}

export interface PasswordResetConfirmationData {
  to: string;
  firstName?: string | null;
  userId: string;
}

export interface EmailUpdateVerificationData {
  to: string;
  firstName?: string | null;
  token: string;
  userId: string;
}

export interface AccountDeletionEmailData {
  to: string;
  firstName?: string | null;
  reason?: string;
  userId: string;
}

export interface MFACodeEmailData {
  to: string;
  firstName?: string | null;
  code: string;
  userId: string;
}

export interface StorageService {
  uploadAvatar(userId: string, file: unknown, mimeType?: string): Promise<string>;
  uploadCover(userId: string, file: unknown, mimeType?: string): Promise<string>;
  getFileUrl(path: string): string;
}

export interface GeolocationService {
  getLocationFromIP(ip: string): Promise<GeolocationData>;
}

export interface GeolocationData {
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface RateLimiterService {
  check(key: string): Promise<RateLimitResult>;
  increment(key: string, ttl: number): Promise<void>;
  reset(key: string): Promise<void>;
}

export interface RateLimitResult {
  isLimited: boolean;
  attempts: number;
  resetAt: Date;
}

export interface TokenBlacklistService {
  add(tokenHash: string, expiresAt: Date, reason: string): Promise<void>;
  has(tokenHash: string): Promise<boolean>;
  cleanup(): Promise<number>;
}
