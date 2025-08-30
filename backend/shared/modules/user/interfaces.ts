/**
 * User management module interfaces
 */

import { IRepository, IStorage, ICache, ILogger } from '../../core/interfaces';

// Main user service interface
export interface IUserService {
  // User CRUD operations
  getUser(id: string): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(data: CreateUserData): Promise<User>;
  updateUser(id: string, data: UpdateUserData): Promise<User>;
  deleteUser(id: string, options?: DeleteUserOptions): Promise<void>;
  
  // Profile operations
  updateProfile(userId: string, profile: UserProfile): Promise<User>;
  uploadAvatar(userId: string, file: FileUpload): Promise<string>;
  removeAvatar(userId: string): Promise<void>;
  
  // Preferences
  getPreferences(userId: string): Promise<UserPreferences>;
  updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences>;
  
  // Activity tracking
  trackActivity(userId: string, activity: UserActivity): Promise<void>;
  getActivityHistory(userId: string, options?: ActivityQueryOptions): Promise<UserActivity[]>;
  
  // Search and filtering
  searchUsers(query: UserSearchQuery): Promise<UserSearchResult>;
  getUsersByIds(ids: string[]): Promise<User[]>;
  
  // Bulk operations
  bulkCreate(users: CreateUserData[]): Promise<BulkOperationResult>;
  bulkUpdate(updates: BulkUpdateData[]): Promise<BulkOperationResult>;
  bulkDelete(ids: string[], options?: DeleteUserOptions): Promise<BulkOperationResult>;
  
  // GDPR compliance
  exportUserData(userId: string): Promise<UserDataExport>;
  anonymizeUser(userId: string): Promise<void>;
  
  // Status management
  suspendUser(userId: string, reason: string, until?: Date): Promise<void>;
  activateUser(userId: string): Promise<void>;
  banUser(userId: string, reason: string): Promise<void>;
}

// User entity
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  profile: UserProfile;
  status: UserStatus;
  roles: string[];
  permissions: string[];
  metadata?: UserMetadata;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
  deletedAt?: Date;
}

// User profile
export interface UserProfile {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  phone?: string;
  phoneVerified?: boolean;
  address?: Address;
  language: string;
  timezone: string;
  country?: string;
}

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country: string;
}

// User status
export interface UserStatus {
  state: UserState;
  reason?: string;
  suspendedUntil?: Date;
  suspendedAt?: Date;
  bannedAt?: Date;
}

export type UserState = 'active' | 'suspended' | 'banned' | 'deleted' | 'pending';

// User preferences
export interface UserPreferences {
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  appearance: AppearancePreferences;
  communication: CommunicationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  digest: 'daily' | 'weekly' | 'monthly' | 'never';
  types: {
    marketing: boolean;
    updates: boolean;
    security: boolean;
    billing: boolean;
  };
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'private' | 'connections';
  showEmail: boolean;
  showPhone: boolean;
  allowDataCollection: boolean;
  allowThirdPartySharing: boolean;
}

export interface AppearancePreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface CommunicationPreferences {
  allowMessages: boolean;
  allowInvites: boolean;
  blockedUsers: string[];
}

// User metadata (flexible schema)
export interface UserMetadata {
  source?: string; // How user signed up
  referrer?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  customFields?: Record<string, any>;
}

// User activity
export interface UserActivity {
  userId: string;
  type: ActivityType;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

export type ActivityType = 
  | 'auth'
  | 'profile'
  | 'settings'
  | 'content'
  | 'billing'
  | 'api'
  | 'admin';

// Data transfer objects
export interface CreateUserData {
  email: string;
  password?: string;
  profile?: Partial<UserProfile>;
  roles?: string[];
  metadata?: UserMetadata;
  sendWelcomeEmail?: boolean;
}

export interface UpdateUserData {
  email?: string;
  profile?: Partial<UserProfile>;
  roles?: string[];
  permissions?: string[];
  metadata?: UserMetadata;
}

export interface DeleteUserOptions {
  mode: 'soft' | 'hard' | 'anonymize';
  reason?: string;
  notifyUser?: boolean;
}

// Search interfaces
export interface UserSearchQuery {
  query?: string; // Full text search
  email?: string;
  status?: UserState[];
  roles?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  lastActiveAfter?: Date;
  lastActiveBefore?: Date;
  metadata?: Record<string, any>;
  orderBy?: UserOrderBy[];
  limit?: number;
  offset?: number;
}

export interface UserOrderBy {
  field: 'createdAt' | 'updatedAt' | 'lastActiveAt' | 'email' | 'displayName';
  direction: 'asc' | 'desc';
}

export interface UserSearchResult {
  users: User[];
  total: number;
  limit: number;
  offset: number;
}

// Bulk operation interfaces
export interface BulkUpdateData {
  id: string;
  data: UpdateUserData;
}

export interface BulkOperationResult {
  successful: string[];
  failed: BulkOperationError[];
  total: number;
}

export interface BulkOperationError {
  id: string;
  error: string;
}

// File upload interface
export interface FileUpload {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

// Activity query options
export interface ActivityQueryOptions {
  type?: ActivityType[];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// GDPR data export
export interface UserDataExport {
  user: User;
  activities: UserActivity[];
  preferences: UserPreferences;
  sessions: SessionData[];
  files: FileData[];
  associatedData: Record<string, any>;
  exportedAt: Date;
}

export interface SessionData {
  id: string;
  createdAt: Date;
  lastActivityAt: Date;
  ip: string;
  userAgent: string;
}

export interface FileData {
  name: string;
  url: string;
  size: number;
  uploadedAt: Date;
}

// User repository interface
export interface IUserRepository extends IRepository<UserEntity> {
  findByEmail(email: string): Promise<UserEntity | null>;
  findByIds(ids: string[]): Promise<UserEntity[]>;
  search(query: UserSearchQuery): Promise<{ users: UserEntity[]; total: number }>;
  updateLastActive(userId: string): Promise<void>;
  softDelete(userId: string): Promise<boolean>;
  restore(userId: string): Promise<boolean>;
}

// User entity for database
export interface UserEntity {
  id: string;
  email: string;
  emailVerified: boolean;
  profile: UserProfile;
  status: UserStatus;
  roles: string[];
  permissions: string[];
  preferences: UserPreferences;
  metadata?: UserMetadata;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
  deletedAt?: Date;
}

// User events
export interface UserEvents {
  'user.created': { userId: string; email: string };
  'user.updated': { userId: string; changes: string[] };
  'user.deleted': { userId: string; mode: 'soft' | 'hard' | 'anonymize' };
  'user.suspended': { userId: string; reason: string; until?: Date };
  'user.activated': { userId: string };
  'user.banned': { userId: string; reason: string };
  'user.profile.updated': { userId: string; fields: string[] };
  'user.avatar.uploaded': { userId: string; url: string };
  'user.avatar.removed': { userId: string };
  'user.preferences.updated': { userId: string; preferences: string[] };
  'user.activity': UserActivity;
}

// User configuration
export interface UserConfig {
  avatar: {
    maxSize: number; // bytes
    allowedTypes: string[];
    dimensions: {
      width: number;
      height: number;
    };
    storage: 'local' | 's3' | 'gcs' | 'azure';
  };
  profile: {
    requiredFields: string[];
    customFields?: CustomFieldDefinition[];
  };
  privacy: {
    defaultVisibility: 'public' | 'private';
    allowDataExport: boolean;
    dataRetentionDays: number;
  };
  limits: {
    maxBulkOperations: number;
    searchResultLimit: number;
    activityHistoryDays: number;
  };
}

export interface CustomFieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  required?: boolean;
  validation?: any; // JSON schema
}