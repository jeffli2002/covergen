/**
 * Authentication module interfaces
 */

import { IRepository, ICache, IEmailService, ILogger } from '../../core/interfaces';

// Main auth service interface
export interface IAuthService {
  // Authentication methods
  authenticate(credentials: AuthCredentials): Promise<AuthResult>;
  validateToken(token: string): Promise<TokenPayload>;
  refreshToken(refreshToken: string): Promise<AuthResult>;
  logout(userId: string, deviceId?: string): Promise<void>;
  logoutAllDevices(userId: string): Promise<void>;
  
  // OAuth methods
  getOAuthUrl(provider: OAuthProvider, state?: string): string;
  handleOAuthCallback(provider: OAuthProvider, code: string, state?: string): Promise<AuthResult>;
  
  // Magic link methods
  sendMagicLink(email: string, redirectUrl?: string): Promise<void>;
  verifyMagicLink(token: string): Promise<AuthResult>;
  
  // MFA methods
  enableMFA(userId: string, type: MFAType): Promise<MFASetupResult>;
  verifyMFA(userId: string, code: string): Promise<boolean>;
  disableMFA(userId: string, code: string): Promise<void>;
  
  // Session management
  getActiveSessions(userId: string): Promise<Session[]>;
  revokeSession(userId: string, sessionId: string): Promise<void>;
}

// Authentication credentials
export type AuthCredentials = 
  | EmailPasswordCredentials
  | OAuthCredentials
  | MagicLinkCredentials
  | APIKeyCredentials;

export interface EmailPasswordCredentials {
  type: 'email_password';
  email: string;
  password: string;
  deviceId?: string;
  deviceName?: string;
}

export interface OAuthCredentials {
  type: 'oauth';
  provider: OAuthProvider;
  code: string;
  state?: string;
}

export interface MagicLinkCredentials {
  type: 'magic_link';
  token: string;
}

export interface APIKeyCredentials {
  type: 'api_key';
  apiKey: string;
}

// OAuth providers
export type OAuthProvider = 'google' | 'github' | 'microsoft' | 'apple' | 'facebook';

// MFA types
export type MFAType = 'totp' | 'sms' | 'email';

// Auth result
export interface AuthResult {
  user: AuthUser;
  tokens: TokenPair;
  session: Session;
}

// User representation in auth context
export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  roles: string[];
  permissions: string[];
  metadata?: Record<string, any>;
}

// Token interfaces
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface TokenPayload {
  sub: string; // user id
  email: string;
  roles: string[];
  permissions: string[];
  sessionId: string;
  iat: number;
  exp: number;
  type: 'access' | 'refresh';
}

// Session interface
export interface Session {
  id: string;
  userId: string;
  deviceId?: string;
  deviceName?: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
}

// MFA setup result
export interface MFASetupResult {
  type: MFAType;
  secret?: string; // For TOTP
  qrCode?: string; // For TOTP
  phoneNumber?: string; // For SMS
  backupCodes?: string[];
}

// Auth provider interface
export interface IAuthProvider {
  authenticate(credentials: any): Promise<ProviderUser>;
  validateToken?(token: string): Promise<boolean>;
}

export interface ProviderUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  avatar?: string;
  provider: string;
  providerData?: Record<string, any>;
}

// Auth strategy interface
export interface IAuthStrategy {
  name: string;
  authenticate(request: AuthRequest): Promise<AuthUser | null>;
  validate?(token: string): Promise<TokenPayload | null>;
}

export interface AuthRequest {
  headers: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
  ip?: string;
  userAgent?: string;
}

// Password policy interface
export interface IPasswordPolicy {
  validate(password: string): PasswordValidationResult;
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'strong' | 'very_strong';
}

// Rate limiter interface
export interface IRateLimiter {
  check(key: string, limit: number, window: number): Promise<RateLimitResult>;
  reset(key: string): Promise<void>;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

// Auth repository interface
export interface IAuthRepository extends IRepository<AuthEntity> {
  findByEmail(email: string): Promise<AuthEntity | null>;
  findByProvider(provider: string, providerId: string): Promise<AuthEntity | null>;
  updateLastLogin(userId: string): Promise<void>;
  storeRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  revokeRefreshToken(token: string): Promise<boolean>;
  revokeAllRefreshTokens(userId: string): Promise<number>;
}

// Auth entity
export interface AuthEntity {
  id: string;
  email: string;
  emailVerified: boolean;
  passwordHash?: string;
  providers: AuthProviderConnection[];
  mfaEnabled: boolean;
  mfaSecret?: string;
  mfaBackupCodes?: string[];
  roles: string[];
  permissions: string[];
  lastLoginAt?: Date;
  loginCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthProviderConnection {
  provider: OAuthProvider;
  providerId: string;
  providerData?: Record<string, any>;
  connectedAt: Date;
}

// Auth events
export interface AuthEvents {
  'auth.login': { userId: string; method: string; ip: string };
  'auth.logout': { userId: string; sessionId: string };
  'auth.register': { userId: string; method: string };
  'auth.mfa.enabled': { userId: string; type: MFAType };
  'auth.mfa.disabled': { userId: string };
  'auth.password.changed': { userId: string };
  'auth.password.reset': { userId: string };
  'auth.token.refreshed': { userId: string; sessionId: string };
  'auth.failed': { email?: string; reason: string; ip: string };
}

// Auth configuration
export interface AuthConfig {
  jwt: {
    secret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
    issuer: string;
    audience: string;
  };
  oauth: {
    [K in OAuthProvider]?: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
      scope?: string[];
    };
  };
  mfa: {
    issuer: string;
    window: number;
  };
  password: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    bcryptRounds: number;
  };
  rateLimit: {
    login: { limit: number; window: number };
    register: { limit: number; window: number };
    passwordReset: { limit: number; window: number };
  };
  session: {
    duration: number;
    renewThreshold: number;
    maxConcurrent: number;
  };
  magicLink: {
    expiresIn: number;
    baseUrl: string;
  };
}