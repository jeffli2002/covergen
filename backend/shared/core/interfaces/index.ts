/**
 * Core interfaces for the shared modules system
 */

// Base repository interface
export interface IRepository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findOne(criteria: Partial<T>): Promise<T | null>;
  findMany(criteria: Partial<T>, options?: QueryOptions): Promise<T[]>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: ID, data: Partial<T>): Promise<T>;
  delete(id: ID): Promise<boolean>;
  count(criteria?: Partial<T>): Promise<number>;
}

// Query options for repositories
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: OrderBy[];
  include?: string[];
  select?: string[];
}

export interface OrderBy {
  field: string;
  direction: 'asc' | 'desc';
}

// Event emitter interface
export interface IEventEmitter {
  emit<T>(event: string, payload: T): void;
  on<T>(event: string, handler: (payload: T) => void | Promise<void>): void;
  off(event: string, handler: Function): void;
}

// Cache interface
export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

// Queue interface
export interface IQueue<T = any> {
  push(job: T, options?: QueueOptions): Promise<string>;
  process(handler: (job: T) => Promise<void>): void;
  on(event: QueueEvent, handler: Function): void;
}

export interface QueueOptions {
  delay?: number;
  priority?: number;
  attempts?: number;
  backoff?: BackoffOptions;
}

export interface BackoffOptions {
  type: 'fixed' | 'exponential';
  delay: number;
}

export type QueueEvent = 'completed' | 'failed' | 'stalled' | 'progress';

// Storage interface
export interface IStorage {
  upload(key: string, data: Buffer | NodeJS.ReadableStream, metadata?: Record<string, string>): Promise<string>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  getUrl(key: string, options?: UrlOptions): Promise<string>;
}

export interface UrlOptions {
  expires?: number;
  contentType?: string;
}

// Logger interface
export interface ILogger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, error?: Error, meta?: any): void;
  child(meta: any): ILogger;
}

// Database transaction interface
export interface ITransaction {
  commit(): Promise<void>;
  rollback(): Promise<void>;
  isActive(): boolean;
}

// Database adapter interface
export interface IDatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  transaction<T>(fn: (trx: ITransaction) => Promise<T>): Promise<T>;
  healthCheck(): Promise<boolean>;
}

// Email service interface
export interface IEmailService {
  send(options: EmailOptions): Promise<EmailResult>;
  sendBulk(recipients: EmailOptions[]): Promise<EmailResult[]>;
}

export interface EmailOptions {
  to: string | string[];
  from?: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
  template?: string;
  templateData?: Record<string, any>;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface EmailResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
}

// Metrics interface
export interface IMetrics {
  increment(metric: string, value?: number, tags?: Record<string, string>): void;
  gauge(metric: string, value: number, tags?: Record<string, string>): void;
  histogram(metric: string, value: number, tags?: Record<string, string>): void;
  timing(metric: string, value: number, tags?: Record<string, string>): void;
}

// Feature flag interface
export interface IFeatureFlags {
  isEnabled(flag: string, context?: FeatureFlagContext): Promise<boolean>;
  getVariation<T>(flag: string, defaultValue: T, context?: FeatureFlagContext): Promise<T>;
}

export interface FeatureFlagContext {
  userId?: string;
  organizationId?: string;
  attributes?: Record<string, any>;
}