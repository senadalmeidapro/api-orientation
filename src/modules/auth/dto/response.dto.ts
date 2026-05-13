import type {
  AccountStats,
  AuthAccountInfo,
  LoginResponse,
  RegisterResponse,
  SessionInfo,
  UserActivity,
  UserProfile,
} from '../interfaces';
import { UserRole, UserStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiResponseDto<T = unknown> {
  @ApiProperty({ description: 'Success', type: Boolean, example: true })
  readonly success: boolean;
  @ApiPropertyOptional({ description: 'Data' })
  readonly data?: T;
  @ApiPropertyOptional({ description: 'Message', type: String, example: 'Message exemple' })
  readonly message?: string;
  @ApiPropertyOptional({ description: 'Error', type: String, example: 'value' })
  readonly error?: string;
  @ApiProperty({ description: 'Timestamp', type: String, example: '2026-01-01T00:00:00.000Z' })
  readonly timestamp: Date;

  constructor(data?: T, message?: string, error?: string) {
    this.success = !error;
    if (data !== undefined) this.data = data;
    if (message !== undefined) this.message = message;
    if (error !== undefined) this.error = error;
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
  @ApiProperty({ description: 'Items', type: [Object], example: [{}] })
  readonly items: T[];
  @ApiProperty({ description: 'Total', type: Number, example: 1 })
  readonly total: number;
  @ApiProperty({ description: 'Page', type: Number, example: 1 })
  readonly page: number;
  @ApiProperty({ description: 'Limit', type: Number, example: 20 })
  readonly limit: number;
  @ApiProperty({ description: 'Total pages', type: Number, example: 1 })
  readonly totalPages: number;
  @ApiProperty({ description: 'Has next', type: Boolean, example: true })
  readonly hasNext: boolean;
  @ApiProperty({ description: 'Has previous', type: Boolean, example: true })
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
  @ApiProperty({ description: 'User id', type: String, example: 'clx123abc0001' })
  readonly userId: string;
  @ApiProperty({ description: 'Email', type: String, example: 'user@example.com' })
  readonly email: string;
  @ApiProperty({ description: 'Username', type: String, example: 'John Doe' })
  readonly username: string;
  @ApiProperty({ description: 'Message', type: String, example: 'Message exemple' })
  readonly message: string;
  @ApiProperty({ description: 'Requires email verification', type: Boolean, example: true })
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
  @ApiProperty({ description: 'User id', type: String, example: 'clx123abc0001' })
  readonly userId: string;
  @ApiProperty({ description: 'Email', type: String, example: 'user@example.com' })
  readonly email: string;
  @ApiProperty({ description: 'Username', type: String, example: 'John Doe' })
  readonly username: string;
  @ApiPropertyOptional({ description: 'Temp token', type: String, example: 'tok_sample_123456' })
  readonly tempToken?: string;
  @ApiPropertyOptional({
    description: 'Access token',
    type: String,
    example: 'tok_sample_123456',
  })
  readonly accessToken?: string;
  @ApiPropertyOptional({
    description: 'Refresh token',
    type: String,
    example: 'tok_sample_123456',
  })
  readonly refreshToken?: string;
  @ApiPropertyOptional({
    description: 'Session token',
    type: String,
    example: 'tok_sample_123456',
  })
  readonly sessionToken?: string;
  @ApiPropertyOptional({
    description: 'User',
    type: () => ProfileResponseDto,
  })
  readonly user?: UserProfile;
  @ApiPropertyOptional({ description: 'Is new user', type: Boolean, example: true })
  readonly isNewUser?: boolean;

  constructor(data: LoginResponse) {
    this.userId = data.userId;
    this.email = data.email;
    this.username = data.username;
    if (data.tempToken !== undefined) this.tempToken = data.tempToken;
    if (data.accessToken !== undefined) this.accessToken = data.accessToken;
    if (data.refreshToken !== undefined) this.refreshToken = data.refreshToken;
    if (data.sessionToken !== undefined) this.sessionToken = data.sessionToken;
    if (data.user !== undefined) this.user = data.user;
    if (data.isNewUser !== undefined) this.isNewUser = data.isNewUser;
  }
}

export class ProfileResponseDto implements UserProfile {
  // Implémentation complète avec tous les champs
  @ApiProperty({ description: 'Id', type: String, example: 'clx123abc0001' })
  id!: string;
  @ApiProperty({ description: 'Email', type: String, example: 'user@example.com' })
  email!: string;
  @ApiProperty({ description: 'Username', type: String, example: 'John Doe' })
  username!: string;
  @ApiProperty({ description: 'First name', type: Object, example: 'value' })
  firstName!: string | null;
  @ApiProperty({ description: 'Last name', type: Object, example: 'value' })
  lastName!: string | null;
  @ApiProperty({ description: 'Display name', type: Object, example: 'value' })
  displayName!: string | null;
  @ApiProperty({ description: 'Bio', type: Object, example: 'value' })
  bio!: string | null;
  @ApiProperty({ description: 'Avatar url', type: Object, example: 'value' })
  avatarUrl!: string | null;
  @ApiProperty({ description: 'Cover url', type: Object, example: 'value' })
  coverUrl!: string | null;
  @ApiProperty({ description: 'Company', type: Object, example: 'value' })
  company!: string | null;
  @ApiProperty({ description: 'Job title', type: Object, example: 'value' })
  jobTitle!: string | null;
  @ApiProperty({ description: 'Website', type: Object, example: 'value' })
  website!: string | null;
  @ApiProperty({ description: 'Location', type: Object, example: 'value' })
  location!: string | null;
  @ApiProperty({ description: 'Role', enum: UserRole, example: Object.values(UserRole)[0] })
  role!: UserRole;
  @ApiProperty({ description: 'Status', enum: UserStatus, example: Object.values(UserStatus)[0] })
  status!: UserStatus;
  @ApiProperty({ description: 'Email verified', type: Boolean, example: true })
  emailVerified!: boolean;
  @ApiProperty({ description: 'Phone number', type: Object, example: 'value' })
  phoneNumber!: string | null;
  @ApiProperty({ description: 'Phone verified', type: Boolean, example: true })
  phoneVerified!: boolean;
  @ApiProperty({ description: 'Two factor enabled', type: Boolean, example: true })
  twoFactorEnabled!: boolean;
  @ApiProperty({ description: 'Onboarding completed', type: Boolean, example: true })
  onboardingCompleted!: boolean;
  @ApiProperty({ description: 'Onboarding step', type: Number, example: 1 })
  onboardingStep!: number;
  @ApiProperty({ description: 'Locale', type: String, example: 'value' })
  locale!: string;
  @ApiProperty({ description: 'Timezone', type: String, example: 'value' })
  timezone!: string;
  @ApiProperty({ description: 'Theme', type: String, example: 'value' })
  theme!: string;
  @ApiProperty({ description: 'Editor settings', type: Object, example: { key: 'value' } })
  editorSettings!: Record<string, unknown> | null;
  @ApiProperty({ description: 'Notification settings', type: Object, example: { key: 'value' } })
  notificationSettings!: Record<string, unknown> | null;
  @ApiProperty({ description: 'Privacy settings', type: Object, example: { key: 'value' } })
  privacySettings!: Record<string, unknown> | null;
  @ApiProperty({ description: 'Created at', type: String, example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;
  @ApiProperty({ description: 'Updated at', type: String, example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;
  @ApiProperty({ description: 'Last login at', type: Object, example: 'value' })
  lastLoginAt!: Date | null;

  constructor(data: UserProfile) {
    Object.assign(this, data);
  }
  @ApiProperty({ description: 'Auth accounts', type: [Object], example: [{}] })
  authAccounts: AuthAccountInfo[] = [];
}

export class SessionResponseDto implements SessionInfo {
  @ApiProperty({ description: 'Id', type: String, example: 'clx123abc0001' })
  readonly id!: string;
  @ApiProperty({ description: 'Device type', type: Object, example: 'value' })
  readonly deviceType!: string | null;
  @ApiProperty({ description: 'Device browser', type: Object, example: 'value' })
  readonly deviceBrowser!: string | null;
  @ApiProperty({ description: 'Os', type: Object, example: 'value' })
  readonly os!: string | null;
  @ApiProperty({ description: 'Country', type: Object, example: 'value' })
  readonly country!: string | null;
  @ApiProperty({ description: 'City', type: Object, example: 'value' })
  readonly city!: string | null;
  @ApiProperty({ description: 'Ip address', type: Object, example: 'value' })
  readonly ipAddress!: string | null;
  @ApiProperty({
    description: 'Last activity at',
    type: String,
    example: '2026-01-01T00:00:00.000Z',
  })
  readonly lastActivityAt!: Date;
  @ApiProperty({ description: 'Created at', type: String, example: '2026-01-01T00:00:00.000Z' })
  readonly createdAt!: Date;
  @ApiProperty({ description: 'Is current', type: Boolean, example: true })
  readonly isCurrent!: boolean;

  constructor(data: SessionInfo) {
    Object.assign(this, data);
  }
}

export class AccountStatsDto implements AccountStats {
  @ApiProperty({ description: 'User', type: Object, example: 'value' })
  readonly user!: {
    id: string;
    email: string;
    username: string;
    createdAt: Date;
    lastLoginAt: Date | null;
  };
  @ApiProperty({ description: 'Stats', type: Object, example: {} })
  readonly stats!: {
    projectCount: number;
    sessionCount: number;
    unreadNotifications: number;
    storageUsed: number;
  };
  @ApiProperty({ description: 'Recent activity', type: [Object], example: [{}] })
  readonly recentActivity!: UserActivity[];

  constructor(data: AccountStats) {
    Object.assign(this, data);
  }
}
