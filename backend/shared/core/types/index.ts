/**
 * Common types used across all modules
 */

// Base entity type
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

// Sort types
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

// Filter types
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'between';

export interface FilterParam {
  field: string;
  operator: FilterOperator;
  value: any;
}

// Timestamp types
export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeletable {
  deletedAt?: Date;
  deletedBy?: string;
}

// Audit types
export interface Auditable extends Timestamped {
  createdBy?: string;
  updatedBy?: string;
}

// Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: Record<string, any>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Request context
export interface RequestContext {
  requestId: string;
  userId?: string;
  organizationId?: string;
  roles?: string[];
  permissions?: string[];
  ip?: string;
  userAgent?: string;
  locale?: string;
  timezone?: string;
}

// Multi-tenancy
export interface TenantAware {
  tenantId: string;
  organizationId?: string;
}

// Versioning
export interface Versioned {
  version: number;
  previousVersionId?: string;
}

// Status types
export enum EntityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

// Common value objects
export interface Money {
  amount: number;
  currency: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface PhoneNumber {
  countryCode: string;
  number: string;
  type?: 'mobile' | 'home' | 'work';
  verified?: boolean;
}

// File/Media types
export interface FileMetadata {
  filename: string;
  mimetype: string;
  size: number;
  url?: string;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
}

// Notification types
export interface NotificationPayload {
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  label: string;
  url?: string;
  metadata?: Record<string, any>;
}

// Job/Task types
export interface Job<T = any> {
  id: string;
  type: string;
  data: T;
  status: JobStatus;
  priority: number;
  attempts: number;
  maxAttempts: number;
  result?: any;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
}

export enum JobStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled'
}

// Environment types
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test'
}

// Feature flag types
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  variants?: FeatureFlagVariant[];
  rules?: FeatureFlagRule[];
}

export interface FeatureFlagVariant {
  key: string;
  weight: number;
  value: any;
}

export interface FeatureFlagRule {
  attribute: string;
  operator: 'eq' | 'ne' | 'in' | 'nin' | 'gt' | 'gte' | 'lt' | 'lte';
  value: any;
}

// Security types
export interface SecurityContext {
  ipAddress: string;
  userAgent: string;
  fingerprint?: string;
  geoLocation?: GeoLocation;
  riskScore?: number;
}

// Localization types
export interface LocalizedString {
  [locale: string]: string;
}

export interface LocalizedContent<T = any> {
  [locale: string]: T;
}

// Metadata types
export type Metadata = Record<string, any>;

export interface MetadataAware {
  metadata?: Metadata;
}

// Event types
export interface DomainEvent<T = any> {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  payload: T;
  metadata?: Metadata;
  occurredAt: Date;
  version?: number;
}

// Health check types
export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  checks: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

// Rate limiting types
export interface RateLimit {
  limit: number;
  remaining: number;
  resetAt: Date;
  windowMs: number;
}

// Webhook types
export interface WebhookPayload<T = any> {
  id: string;
  type: string;
  timestamp: Date;
  data: T;
  signature?: string;
}

// Cache types
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[];
  compress?: boolean;
}

// Queue types
export interface QueueMessage<T = any> {
  id: string;
  data: T;
  attempts: number;
  timestamp: Date;
  metadata?: Metadata;
}

// Batch operation types
export interface BatchOperation<T, R> {
  items: T[];
  process: (item: T) => Promise<R>;
  onSuccess?: (item: T, result: R) => void;
  onError?: (item: T, error: Error) => void;
  concurrency?: number;
}

export interface BatchResult<T, R> {
  successful: Array<{ item: T; result: R }>;
  failed: Array<{ item: T; error: Error }>;
  total: number;
  successCount: number;
  failureCount: number;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

export type PickRequired<T> = Pick<T, RequiredKeys<T>>;
export type PickOptional<T> = Pick<T, OptionalKeys<T>>;

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;