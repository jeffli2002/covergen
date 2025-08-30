/**
 * Core authentication service implementation
 */

import { EventEmitter } from 'events';
import {
  IAuthService,
  AuthCredentials,
  AuthResult,
  TokenPayload,
  OAuthProvider,
  MFAType,
  MFASetupResult,
  Session,
  AuthUser,
  TokenPair,
  AuthEvents,
  IAuthRepository,
  IPasswordPolicy,
  IRateLimiter,
  AuthConfig
} from '../interfaces';
import {
  ICache,
  IEmailService,
  ILogger,
  IEventEmitter
} from '../../../core/interfaces';
import {
  AuthenticationError,
  InvalidCredentialsError,
  TokenExpiredError,
  InvalidTokenError,
  MFARequiredError,
  RateLimitError,
  ValidationError,
  NotFoundError
} from '../../../core/errors';
import { RequestContext } from '../../../core/types';

export class AuthService implements IAuthService {
  private eventEmitter: IEventEmitter;
  
  constructor(
    private readonly config: AuthConfig,
    private readonly repository: IAuthRepository,
    private readonly passwordPolicy: IPasswordPolicy,
    private readonly rateLimiter: IRateLimiter,
    private readonly cache: ICache,
    private readonly emailService: IEmailService,
    private readonly logger: ILogger,
    private readonly tokenService: ITokenService,
    private readonly providers: Map<OAuthProvider, IOAuthProvider>,
    private readonly mfaService: IMFAService
  ) {
    this.eventEmitter = new EventEmitter() as IEventEmitter;
  }

  async authenticate(credentials: AuthCredentials, context?: RequestContext): Promise<AuthResult> {
    const ip = context?.ip || 'unknown';
    const userAgent = context?.userAgent || 'unknown';

    try {
      // Check rate limiting
      await this.checkRateLimit('auth', ip);

      let authUser: AuthUser;
      let authEntity: any;

      switch (credentials.type) {
        case 'email_password':
          authEntity = await this.authenticateWithPassword(credentials);
          break;
        
        case 'oauth':
          authEntity = await this.authenticateWithOAuth(credentials);
          break;
        
        case 'magic_link':
          authEntity = await this.authenticateWithMagicLink(credentials);
          break;
        
        case 'api_key':
          authEntity = await this.authenticateWithAPIKey(credentials);
          break;
        
        default:
          throw new AuthenticationError('Invalid authentication type');
      }

      // Check if MFA is required
      if (authEntity.mfaEnabled && credentials.type !== 'api_key') {
        throw new MFARequiredError(['totp']); // TODO: Get available MFA methods
      }

      // Create auth user from entity
      authUser = this.mapEntityToAuthUser(authEntity);

      // Generate tokens
      const tokens = await this.generateTokenPair(authUser, authEntity.id);

      // Create session
      const session = await this.createSession({
        userId: authEntity.id,
        deviceId: credentials.type === 'email_password' ? credentials.deviceId : undefined,
        deviceName: credentials.type === 'email_password' ? credentials.deviceName : undefined,
        ipAddress: ip,
        userAgent: userAgent
      });

      // Update last login
      await this.repository.updateLastLogin(authEntity.id);

      // Emit login event
      this.eventEmitter.emit<AuthEvents['auth.login']>('auth.login', {
        userId: authEntity.id,
        method: credentials.type,
        ip: ip
      });

      return {
        user: authUser,
        tokens,
        session
      };
    } catch (error) {
      // Emit failed auth event
      this.eventEmitter.emit<AuthEvents['auth.failed']>('auth.failed', {
        email: credentials.type === 'email_password' ? credentials.email : undefined,
        reason: error.message,
        ip: ip
      });
      
      throw error;
    }
  }

  async validateToken(token: string): Promise<TokenPayload> {
    try {
      const payload = await this.tokenService.verify(token);
      
      // Check if token is blacklisted
      const isBlacklisted = await this.cache.has(`blacklist:token:${token}`);
      if (isBlacklisted) {
        throw new InvalidTokenError('Token has been revoked');
      }

      // Check if session is still valid
      const session = await this.cache.get<Session>(`session:${payload.sessionId}`);
      if (!session) {
        throw new InvalidTokenError('Session not found');
      }

      if (new Date(session.expiresAt) < new Date()) {
        throw new TokenExpiredError('access');
      }

      return payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw error;
      }
      throw new InvalidTokenError(error.message);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      const payload = await this.tokenService.verify(refreshToken);
      
      if (payload.type !== 'refresh') {
        throw new InvalidTokenError('Invalid token type');
      }

      // Get user entity
      const authEntity = await this.repository.findById(payload.sub);
      if (!authEntity) {
        throw new NotFoundError('User');
      }

      // Create auth user
      const authUser = this.mapEntityToAuthUser(authEntity);

      // Generate new token pair
      const tokens = await this.generateTokenPair(authUser, authEntity.id);

      // Get existing session
      const session = await this.cache.get<Session>(`session:${payload.sessionId}`);
      if (!session) {
        throw new InvalidTokenError('Session not found');
      }

      // Update session activity
      session.lastActivityAt = new Date();
      await this.cache.set(`session:${session.id}`, session, this.config.session.duration);

      // Revoke old refresh token
      await this.revokeToken(refreshToken);

      // Store new refresh token
      const expiresAt = new Date(Date.now() + this.parseTimeString(this.config.jwt.refreshExpiresIn));
      await this.repository.storeRefreshToken(authEntity.id, tokens.refreshToken, expiresAt);

      // Emit token refresh event
      this.eventEmitter.emit<AuthEvents['auth.token.refreshed']>('auth.token.refreshed', {
        userId: authEntity.id,
        sessionId: session.id
      });

      return {
        user: authUser,
        tokens,
        session
      };
    } catch (error) {
      throw new InvalidTokenError(error.message);
    }
  }

  async logout(userId: string, deviceId?: string): Promise<void> {
    // Get all user sessions
    const sessions = await this.getActiveSessions(userId);
    
    // Find session to logout
    const sessionToLogout = deviceId 
      ? sessions.find(s => s.deviceId === deviceId)
      : sessions[0]; // Logout current session if no deviceId specified

    if (sessionToLogout) {
      await this.revokeSession(userId, sessionToLogout.id);
      
      // Emit logout event
      this.eventEmitter.emit<AuthEvents['auth.logout']>('auth.logout', {
        userId,
        sessionId: sessionToLogout.id
      });
    }
  }

  async logoutAllDevices(userId: string): Promise<void> {
    // Get all user sessions
    const sessions = await this.getActiveSessions(userId);
    
    // Revoke all sessions
    for (const session of sessions) {
      await this.revokeSession(userId, session.id);
    }

    // Revoke all refresh tokens
    await this.repository.revokeAllRefreshTokens(userId);
    
    this.logger.info('All devices logged out', { userId, sessionCount: sessions.length });
  }

  async getOAuthUrl(provider: OAuthProvider, state?: string): Promise<string> {
    const oauthProvider = this.providers.get(provider);
    if (!oauthProvider) {
      throw new ValidationError('Invalid OAuth provider', [
        { field: 'provider', message: `Provider ${provider} is not supported` }
      ]);
    }

    return oauthProvider.getAuthorizationUrl(state);
  }

  async handleOAuthCallback(provider: OAuthProvider, code: string, state?: string): Promise<AuthResult> {
    const oauthProvider = this.providers.get(provider);
    if (!oauthProvider) {
      throw new ValidationError('Invalid OAuth provider', [
        { field: 'provider', message: `Provider ${provider} is not supported` }
      ]);
    }

    // Exchange code for user info
    const providerUser = await oauthProvider.handleCallback(code, state);

    // Find or create user
    let authEntity = await this.repository.findByProvider(provider, providerUser.id);
    
    if (!authEntity) {
      // Check if user exists with same email
      authEntity = await this.repository.findByEmail(providerUser.email);
      
      if (authEntity) {
        // Link provider to existing user
        authEntity.providers.push({
          provider,
          providerId: providerUser.id,
          providerData: providerUser.providerData,
          connectedAt: new Date()
        });
        await this.repository.update(authEntity.id, authEntity);
      } else {
        // Create new user
        authEntity = await this.repository.create({
          email: providerUser.email,
          emailVerified: providerUser.emailVerified,
          providers: [{
            provider,
            providerId: providerUser.id,
            providerData: providerUser.providerData,
            connectedAt: new Date()
          }],
          mfaEnabled: false,
          roles: ['user'],
          permissions: [],
          loginCount: 0
        });

        // Emit registration event
        this.eventEmitter.emit<AuthEvents['auth.register']>('auth.register', {
          userId: authEntity.id,
          method: 'oauth'
        });
      }
    }

    // Create auth result
    const authUser = this.mapEntityToAuthUser(authEntity);
    const tokens = await this.generateTokenPair(authUser, authEntity.id);
    const session = await this.createSession({
      userId: authEntity.id,
      ipAddress: 'unknown',
      userAgent: 'unknown'
    });

    await this.repository.updateLastLogin(authEntity.id);

    return {
      user: authUser,
      tokens,
      session
    };
  }

  async sendMagicLink(email: string, redirectUrl?: string): Promise<void> {
    // Check rate limiting
    await this.checkRateLimit('magic_link', email);

    // Generate magic link token
    const token = await this.tokenService.generateMagicLinkToken(email);
    
    // Build magic link URL
    const magicLinkUrl = `${this.config.magicLink.baseUrl}/auth/magic-link?token=${token}${
      redirectUrl ? `&redirect=${encodeURIComponent(redirectUrl)}` : ''
    }`;

    // Store token with expiry
    await this.cache.set(
      `magic_link:${token}`,
      { email, redirectUrl },
      this.config.magicLink.expiresIn
    );

    // Send email
    await this.emailService.send({
      to: email,
      subject: 'Your magic sign-in link',
      template: 'magic-link',
      templateData: {
        magicLinkUrl,
        expiresIn: Math.floor(this.config.magicLink.expiresIn / 60) // Convert to minutes
      }
    });

    this.logger.info('Magic link sent', { email });
  }

  async verifyMagicLink(token: string): Promise<AuthResult> {
    // Get token data from cache
    const tokenData = await this.cache.get<{ email: string; redirectUrl?: string }>(
      `magic_link:${token}`
    );

    if (!tokenData) {
      throw new InvalidTokenError('Invalid or expired magic link');
    }

    // Delete token (one-time use)
    await this.cache.delete(`magic_link:${token}`);

    // Find or create user
    let authEntity = await this.repository.findByEmail(tokenData.email);
    
    if (!authEntity) {
      // Create new user
      authEntity = await this.repository.create({
        email: tokenData.email,
        emailVerified: true,
        providers: [],
        mfaEnabled: false,
        roles: ['user'],
        permissions: [],
        loginCount: 0
      });

      // Emit registration event
      this.eventEmitter.emit<AuthEvents['auth.register']>('auth.register', {
        userId: authEntity.id,
        method: 'magic_link'
      });
    } else if (!authEntity.emailVerified) {
      // Mark email as verified
      authEntity.emailVerified = true;
      await this.repository.update(authEntity.id, authEntity);
    }

    // Create auth result
    const authUser = this.mapEntityToAuthUser(authEntity);
    const tokens = await this.generateTokenPair(authUser, authEntity.id);
    const session = await this.createSession({
      userId: authEntity.id,
      ipAddress: 'unknown',
      userAgent: 'unknown'
    });

    await this.repository.updateLastLogin(authEntity.id);

    return {
      user: authUser,
      tokens,
      session
    };
  }

  async enableMFA(userId: string, type: MFAType): Promise<MFASetupResult> {
    const authEntity = await this.repository.findById(userId);
    if (!authEntity) {
      throw new NotFoundError('User');
    }

    const setupResult = await this.mfaService.setup(userId, type);

    // Update user entity
    authEntity.mfaEnabled = true;
    authEntity.mfaSecret = setupResult.secret;
    authEntity.mfaBackupCodes = setupResult.backupCodes;
    await this.repository.update(userId, authEntity);

    // Emit MFA enabled event
    this.eventEmitter.emit<AuthEvents['auth.mfa.enabled']>('auth.mfa.enabled', {
      userId,
      type
    });

    return setupResult;
  }

  async verifyMFA(userId: string, code: string): Promise<boolean> {
    const authEntity = await this.repository.findById(userId);
    if (!authEntity || !authEntity.mfaEnabled) {
      return false;
    }

    return this.mfaService.verify(authEntity.mfaSecret!, code);
  }

  async disableMFA(userId: string, code: string): Promise<void> {
    const authEntity = await this.repository.findById(userId);
    if (!authEntity) {
      throw new NotFoundError('User');
    }

    if (!authEntity.mfaEnabled) {
      return;
    }

    // Verify MFA code before disabling
    const isValid = await this.verifyMFA(userId, code);
    if (!isValid) {
      throw new AuthenticationError('Invalid MFA code');
    }

    // Disable MFA
    authEntity.mfaEnabled = false;
    authEntity.mfaSecret = undefined;
    authEntity.mfaBackupCodes = undefined;
    await this.repository.update(userId, authEntity);

    // Emit MFA disabled event
    this.eventEmitter.emit<AuthEvents['auth.mfa.disabled']>('auth.mfa.disabled', {
      userId
    });
  }

  async getActiveSessions(userId: string): Promise<Session[]> {
    const sessionKeys = await this.cache.get<string[]>(`user_sessions:${userId}`) || [];
    const sessions: Session[] = [];

    for (const sessionId of sessionKeys) {
      const session = await this.cache.get<Session>(`session:${sessionId}`);
      if (session && new Date(session.expiresAt) > new Date()) {
        sessions.push(session);
      }
    }

    return sessions.sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    // Delete session from cache
    await this.cache.delete(`session:${sessionId}`);

    // Remove from user's session list
    const sessionKeys = await this.cache.get<string[]>(`user_sessions:${userId}`) || [];
    const updatedKeys = sessionKeys.filter(id => id !== sessionId);
    await this.cache.set(`user_sessions:${userId}`, updatedKeys);

    this.logger.info('Session revoked', { userId, sessionId });
  }

  // Private helper methods
  private async authenticateWithPassword(credentials: EmailPasswordCredentials): Promise<any> {
    const authEntity = await this.repository.findByEmail(credentials.email);
    if (!authEntity) {
      throw new InvalidCredentialsError();
    }

    if (!authEntity.passwordHash) {
      throw new AuthenticationError('Password authentication not enabled for this account');
    }

    const isValid = await this.passwordPolicy.verify(credentials.password, authEntity.passwordHash);
    if (!isValid) {
      throw new InvalidCredentialsError();
    }

    return authEntity;
  }

  private async authenticateWithOAuth(credentials: OAuthCredentials): Promise<any> {
    return this.handleOAuthCallback(credentials.provider, credentials.code, credentials.state);
  }

  private async authenticateWithMagicLink(credentials: MagicLinkCredentials): Promise<any> {
    return this.verifyMagicLink(credentials.token);
  }

  private async authenticateWithAPIKey(credentials: APIKeyCredentials): Promise<any> {
    // TODO: Implement API key authentication
    throw new AuthenticationError('API key authentication not implemented');
  }

  private mapEntityToAuthUser(entity: any): AuthUser {
    return {
      id: entity.id,
      email: entity.email,
      emailVerified: entity.emailVerified,
      roles: entity.roles,
      permissions: entity.permissions,
      metadata: entity.metadata
    };
  }

  private async generateTokenPair(user: AuthUser, userId: string): Promise<TokenPair> {
    const sessionId = this.generateSessionId();
    
    const accessToken = await this.tokenService.sign({
      sub: userId,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
      sessionId,
      type: 'access'
    }, this.config.jwt.accessExpiresIn);

    const refreshToken = await this.tokenService.sign({
      sub: userId,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
      sessionId,
      type: 'refresh'
    }, this.config.jwt.refreshExpiresIn);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseTimeString(this.config.jwt.accessExpiresIn) / 1000, // Convert to seconds
      tokenType: 'Bearer'
    };
  }

  private async createSession(data: {
    userId: string;
    deviceId?: string;
    deviceName?: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<Session> {
    const sessionId = this.generateSessionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.config.session.duration);

    const session: Session = {
      id: sessionId,
      userId: data.userId,
      deviceId: data.deviceId,
      deviceName: data.deviceName,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      createdAt: now,
      lastActivityAt: now,
      expiresAt
    };

    // Store session
    await this.cache.set(`session:${sessionId}`, session, this.config.session.duration / 1000);

    // Add to user's session list
    const sessionKeys = await this.cache.get<string[]>(`user_sessions:${data.userId}`) || [];
    sessionKeys.push(sessionId);
    await this.cache.set(`user_sessions:${data.userId}`, sessionKeys);

    return session;
  }

  private async checkRateLimit(action: string, identifier: string): Promise<void> {
    const limits = this.config.rateLimit[action];
    if (!limits) return;

    const result = await this.rateLimiter.check(
      `auth:${action}:${identifier}`,
      limits.limit,
      limits.window
    );

    if (!result.allowed) {
      throw new RateLimitError(limits.limit, limits.window, result.resetAt);
    }
  }

  private async revokeToken(token: string): Promise<void> {
    const payload = await this.tokenService.verify(token);
    const ttl = payload.exp - Math.floor(Date.now() / 1000);
    
    if (ttl > 0) {
      await this.cache.set(`blacklist:token:${token}`, true, ttl);
    }
  }

  private generateSessionId(): string {
    return `sess_${this.generateRandomString(32)}`;
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private parseTimeString(time: string): number {
    const units = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000
    };
    
    const match = time.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid time string: ${time}`);
    }
    
    const value = parseInt(match[1]);
    const unit = match[2] as keyof typeof units;
    
    return value * units[unit];
  }
}

// Additional interfaces needed for the auth service
interface ITokenService {
  sign(payload: any, expiresIn: string): Promise<string>;
  verify(token: string): Promise<any>;
  generateMagicLinkToken(email: string): Promise<string>;
}

interface IOAuthProvider {
  getAuthorizationUrl(state?: string): string;
  handleCallback(code: string, state?: string): Promise<any>;
}

interface IMFAService {
  setup(userId: string, type: MFAType): Promise<MFASetupResult>;
  verify(secret: string, code: string): Promise<boolean>;
}