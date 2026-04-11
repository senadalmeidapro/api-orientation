import {
    AccountStats,
    AuthAccountInfo,
    LoginResponse,
    RegisterResponse,
    SessionInfo,
    UserActivity,
    UserProfile,
} from '../interfaces';
import { UserRole, UserStatus } from '@prisma/client';

export class ApiResponseDto<T = unknown> {
    readonly success: boolean;
    readonly data?: T;
    readonly message?: string;
    readonly error?: string;
    readonly timestamp: Date;

    constructor(data?: T, message?: string, error?: string) {
        this.success = !error;
        this.data = data;
        this.message = message;
        this.error = error;
        this.timestamp = new Date();
    }

    static success<T>(data: T, message?: string): ApiResponseDto<T> {
        return new ApiResponseDto<T>(data, message);
    }

    static error<T>(error: string, message?: string): ApiResponseDto<T> {
        return new ApiResponseDto<T>(undefined, message, error);
    }
}

export class PaginatedResponseDto<T> {
    readonly items: T[];
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly totalPages: number;
    readonly hasNext: boolean;
    readonly hasPrevious: boolean;

    constructor(items: T[], total: number, page: number, limit: number) {
        this.items = items;
        this.total = total;
        this.page = page;
        this.limit = limit;
        this.totalPages = Math.ceil(total / limit);
        this.hasNext = page < this.totalPages;
        this.hasPrevious = page > 1;
    }
}

// Response DTOs spécifiques

export class RegisterResponseDto implements RegisterResponse {
    readonly userId: string;
    readonly email: string;
    readonly username: string;
    readonly message: string;
    readonly requiresEmailVerification: boolean;

    constructor(data: RegisterResponse) {
        this.userId = data.userId;
        this.email = data.email;
        this.username = data.username;
        this.message = data.message;
        this.requiresEmailVerification = data.requiresEmailVerification;
    }
}

export class LoginResponseDto implements LoginResponse {
    readonly userId: string;
    readonly email: string;
    readonly username: string;
    readonly tempToken?: string;
    readonly accessToken?: string;
    readonly refreshToken?: string;
    readonly sessionToken?: string;
    readonly user?: UserProfile;
    readonly isNewUser?: boolean;

    constructor(data: LoginResponse) {
        this.userId = data.userId;
        this.email = data.email;
        this.username = data.username;
        this.tempToken = data.tempToken;
        this.accessToken = data.accessToken;
        this.refreshToken = data.refreshToken;
        this.sessionToken = data.sessionToken;
        this.user = data.user;
        this.isNewUser = data.isNewUser;
    }
}

export class ProfileResponseDto implements UserProfile {
    // Implémentation complète avec tous les champs
    id!: string;
    email!: string;
    username!: string;
    firstName!: string | null;
    lastName!: string | null;
    displayName!: string | null;
    bio!: string | null;
    avatarUrl!: string | null;
    coverUrl!: string | null;
    company!: string | null;
    jobTitle!: string | null;
    website!: string | null;
    location!: string | null;
    role!: UserRole;
    status!: UserStatus;
    emailVerified!: boolean;
    phoneNumber!: string | null;
    phoneVerified!: boolean;
    twoFactorEnabled!: boolean;
    onboardingCompleted!: boolean;
    onboardingStep!: number;
    locale!: string;
    timezone!: string;
    theme!: string;
    editorSettings!: Record<string, unknown> | null;
    notificationSettings!: Record<string, unknown> | null;
    privacySettings!: Record<string, unknown> | null;
    createdAt!: Date;
    updatedAt!: Date;
    lastLoginAt!: Date | null;

    constructor(data: UserProfile) {
        Object.assign(this, data);
    }
    authAccounts: AuthAccountInfo[] = [];
}

export class SessionResponseDto implements SessionInfo {
    readonly id!: string;
    readonly deviceType!: string | null;
    readonly deviceBrowser!: string | null;
    readonly os!: string | null;
    readonly country!: string | null;
    readonly city!: string | null;
    readonly ipAddress!: string | null;
    readonly lastActivityAt!: Date;
    readonly createdAt!: Date;
    readonly isCurrent!: boolean;

    constructor(data: SessionInfo) {
        Object.assign(this, data);
    }
}

export class AccountStatsDto implements AccountStats {
    readonly user!: {
        id: string;
        email: string;
        username: string;
        createdAt: Date;
        lastLoginAt: Date | null;
    };
    readonly stats!: {
        projectCount: number;
        sessionCount: number;
        unreadNotifications: number;
        storageUsed: number;
    };
    readonly recentActivity!: UserActivity[];

    constructor(data: AccountStats) {
        Object.assign(this, data);
    }
}
