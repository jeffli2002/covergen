import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/bestauth/db'
import * as bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { cookies } from 'next/headers'
import { createHash, randomBytes } from 'crypto'

export interface SignUpData {
  email: string
  password: string
  name?: string
  metadata?: Record<string, any>
}

export interface SignInData {
  email: string
  password: string
}

export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  email_verified: boolean
  created_at: string
  updated_at: string
}

export interface AuthSession {
  id: string
  user: User
  token: string
  expires_at: string
}

export interface AuthResult<T> {
  success: boolean
  data?: T
  error?: string
}

export interface OAuthProvider {
  name: 'google' | 'github'
  clientId: string
  authUrl: string
  tokenUrl: string
  userInfoUrl: string
}

export interface OAuthInitResult {
  url: string
  state: string
}

export interface UpdateUserData {
  name?: string
  avatar_url?: string
  metadata?: Record<string, any>
}

export class BestAuthService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  /**
   * Sign up a new user with email and password
   */
  async signUp(data: SignUpData): Promise<AuthResult<AuthSession>> {
    try {
      // Validate input
      if (!this.isValidEmail(data.email)) {
        return { success: false, error: 'Invalid email format' }
      }

      if (!this.isValidPassword(data.password)) {
        return { success: false, error: 'Password must be at least 8 characters' }
      }

      // Check if user already exists
      const existingUser = await db.users.findByEmail(data.email)
      if (existingUser) {
        return { success: false, error: 'User already exists' }
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 10)

      // Create user in BestAuth
      const userData = {
        email: data.email.toLowerCase(),
        name: data.name || undefined,
        emailVerified: false
      }

      const user = await db.users.create(userData)
      
      // Store password
      await db.credentials.create(user.id, passwordHash)

      // Create session
      const session = await this.createSession(user.id)

      // Also create user in Supabase for compatibility
      await this.syncUserToSupabase(user)

      // Log the operation
      await this.logSyncOperation('user_create', 'bestauth', 'supabase', user.id, 'success')

      return {
        success: true,
        data: {
          ...session,
          user: this.formatUser(user)
        }
      }
    } catch (error) {
      console.error('SignUp error:', error)
      return { success: false, error: 'Failed to create account' }
    }
  }

  /**
   * Sign in a user with email and password
   */
  async signIn(data: SignInData): Promise<AuthResult<AuthSession>> {
    try {
      // Find user
      const user = await db.users.findByEmail(data.email.toLowerCase())
      if (!user) {
        return { success: false, error: 'Invalid credentials' }
      }

      // Check password
      const credentials = await db.credentials.findByUserId(user.id)
      if (!credentials) {
        return { success: false, error: 'Invalid credentials' }
      }

      const isValidPassword = await bcrypt.compare(data.password, credentials.passwordHash)
      if (!isValidPassword) {
        return { success: false, error: 'Invalid credentials' }
      }

      // Create session
      const session = await this.createSession(user.id)

      // Log activity
      // TODO: Implement activity logging
      // await db.activities.log(user.id, 'signin', { method: 'password' })

      return {
        success: true,
        data: {
          ...session,
          user: this.formatUser(user)
        }
      }
    } catch (error) {
      console.error('SignIn error:', error)
      return { success: false, error: 'Failed to sign in' }
    }
  }

  /**
   * Sign out a user
   */
  async signOut(sessionId: string): Promise<AuthResult<void>> {
    try {
      await db.sessions.delete(sessionId)
      
      // Clear cookies
      const cookieStore = cookies()
      cookieStore.delete('bestauth-session')
      
      return { success: true }
    } catch (error) {
      console.error('SignOut error:', error)
      return { success: false, error: 'Failed to sign out' }
    }
  }

  /**
   * Validate a session token
   */
  async validateSession(token: string): Promise<AuthResult<User>> {
    try {
      const tokenHash = this.hashToken(token)
      const session = await db.sessions.findByTokenHash(tokenHash)
      
      if (!session || new Date(session.expiresAt) < new Date()) {
        return { success: false, error: 'Invalid or expired session' }
      }

      // Update last accessed
      await db.sessions.updateLastAccessed(session.id)

      const user = await db.users.findById(session.userId)
      if (!user) {
        return { success: false, error: 'User not found' }
      }

      return { success: true, data: this.formatUser(user) }
    } catch (error) {
      console.error('ValidateSession error:', error)
      return { success: false, error: 'Failed to validate session' }
    }
  }

  /**
   * Initiate OAuth flow
   */
  async initiateOAuth(provider: 'google' | 'github', redirectUrl: string): Promise<OAuthInitResult> {
    const state = this.generateSecureToken()
    const stateData = {
      provider,
      redirectUrl,
      timestamp: Date.now()
    }

    // Store state in database
    await this.storeOAuthState(state, stateData)

    const authUrl = this.buildOAuthUrl(provider, state)
    
    return {
      url: authUrl,
      state
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(
    provider: 'google' | 'github',
    code: string,
    state: string
  ): Promise<AuthResult<AuthSession>> {
    try {
      // Validate state
      const stateData = await this.validateOAuthState(state)
      if (!stateData) {
        return { success: false, error: 'Invalid OAuth state' }
      }

      // Exchange code for tokens
      const tokens = await this.exchangeOAuthCode(provider, code)
      
      // Get user info
      const userInfo = await this.getOAuthUserInfo(provider, tokens.access_token)
      
      // Find or create user
      let user = await db.users.findByEmail(userInfo.email)
      
      if (!user) {
        // Create new user
        user = await db.users.create({
          email: userInfo.email,
          name: userInfo.name,
          avatarUrl: userInfo.picture,
          emailVerified: true
        })

        // Sync to Supabase
        await this.syncUserToSupabase(user)
        await this.logSyncOperation('user_create', 'bestauth', 'supabase', user.id, 'success')
      }

      // Create or update OAuth account
      // TODO: Implement OAuth account linking
      // await db.oauth.createOrUpdate({
      //   userId: user.id,
      //   provider,
      //   providerAccountId: userInfo.id,
      //   accessToken: tokens.access_token,
      //   refreshToken: tokens.refresh_token,
      //   expiresAt: tokens.expires_at
      // })

      // Create session
      const session = await this.createSession(user.id)

      // Log activity
      // TODO: Implement activity logging
      // await db.activities.log(user.id, 'signin', { method: 'oauth', provider })

      return {
        success: true,
        data: {
          ...session,
          user: this.formatUser(user)
        }
      }
    } catch (error) {
      console.error('OAuth callback error:', error)
      return { success: false, error: 'OAuth authentication failed' }
    }
  }

  /**
   * Send magic link
   */
  async sendMagicLink(email: string): Promise<AuthResult<void>> {
    try {
      if (!this.isValidEmail(email)) {
        return { success: false, error: 'Invalid email format' }
      }

      const token = this.generateSecureToken()
      const tokenHash = this.hashToken(token)
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

      await db.magicLinks.create(email, tokenHash, expiresAt)

      // Send email
      await this.sendMagicLinkEmail(email, token)

      return { success: true }
    } catch (error) {
      console.error('SendMagicLink error:', error)
      return { success: false, error: 'Failed to send magic link' }
    }
  }

  /**
   * Verify magic link
   */
  async verifyMagicLink(token: string): Promise<AuthResult<AuthSession>> {
    try {
      const tokenHash = this.hashToken(token)
      const magicLink = await db.magicLinks.findByTokenHash(tokenHash)

      if (!magicLink || magicLink.used || new Date(magicLink.expiresAt) < new Date()) {
        return { success: false, error: 'Invalid or expired magic link' }
      }

      // Mark as used
      await db.magicLinks.markAsUsed(tokenHash)

      // Find or create user
      let user = await db.users.findByEmail(magicLink.email)
      
      if (!user) {
        user = await db.users.create({
          email: magicLink.email,
          emailVerified: true
        })

        // Sync to Supabase
        await this.syncUserToSupabase(user)
        await this.logSyncOperation('user_create', 'bestauth', 'supabase', user.id, 'success')
      } else {
        // Mark email as verified
        await db.users.update(user.id, { emailVerified: true })
      }

      // Create session
      const session = await this.createSession(user.id)

      // Log activity
      // TODO: Implement activity logging
      // await db.activities.log(user.id, 'signin', { method: 'magic_link' })

      return {
        success: true,
        data: {
          ...session,
          user: this.formatUser(user)
        }
      }
    } catch (error) {
      console.error('VerifyMagicLink error:', error)
      return { success: false, error: 'Failed to verify magic link' }
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<AuthResult<void>> {
    try {
      const user = await db.users.findByEmail(email)
      if (!user) {
        // Don't reveal if user exists
        return { success: true }
      }

      const token = this.generateSecureToken()
      const tokenHash = this.hashToken(token)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await db.passwordResets.create(user.id, tokenHash, expiresAt)

      // Send email
      await this.sendPasswordResetEmail(email, token)

      return { success: true }
    } catch (error) {
      console.error('RequestPasswordReset error:', error)
      return { success: false, error: 'Failed to request password reset' }
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<AuthResult<void>> {
    try {
      if (!this.isValidPassword(newPassword)) {
        return { success: false, error: 'Password must be at least 8 characters' }
      }

      const tokenHash = this.hashToken(token)
      const passwordReset = await db.passwordResets.findByTokenHash(tokenHash)

      if (!passwordReset || passwordReset.used || new Date(passwordReset.expiresAt) < new Date()) {
        return { success: false, error: 'Invalid or expired reset token' }
      }

      // Mark as used
      await db.passwordResets.markAsUsed(tokenHash)

      // Update password
      const passwordHash = await bcrypt.hash(newPassword, 10)
      await db.credentials.update(passwordReset.userId, passwordHash)

      // Log activity
      // TODO: Implement activity logging
      // await db.activities.log(passwordReset.userId, 'password_reset', {})

      return { success: true }
    } catch (error) {
      console.error('ResetPassword error:', error)
      return { success: false, error: 'Failed to reset password' }
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, data: UpdateUserData): Promise<AuthResult<User>> {
    try {
      const user = await db.users.update(userId, data)
      
      // Sync to Supabase
      await this.syncUserToSupabase(user)
      await this.logSyncOperation('user_update', 'bestauth', 'supabase', userId, 'success')

      return { success: true, data: this.formatUser(user) }
    } catch (error) {
      console.error('UpdateUser error:', error)
      return { success: false, error: 'Failed to update user' }
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<AuthResult<void>> {
    try {
      // Delete from BestAuth
      // TODO: Implement user deletion
      // await db.users.delete(userId)
      
      // Delete from Supabase
      const mapping = await this.getUserMapping(userId)
      if (mapping) {
        await this.deleteSupabaseUser(mapping.supabase_user_id)
      }

      await this.logSyncOperation('user_delete', 'bestauth', 'supabase', userId, 'success')

      return { success: true }
    } catch (error) {
      console.error('DeleteUser error:', error)
      return { success: false, error: 'Failed to delete user' }
    }
  }

  // Helper methods

  private async createSession(userId: string): Promise<AuthSession> {
    const sessionId = uuidv4()
    const token = this.generateSecureToken()
    const tokenHash = this.hashToken(token)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const session = await db.sessions.create({
      userId,
      tokenHash,
      expiresAt
    })

    // Set cookie
    const cookieStore = cookies()
    cookieStore.set('bestauth-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours in seconds
      path: '/'
    })

    const user = await db.users.findById(userId)

    return {
      id: sessionId,
      user: this.formatUser(user!),
      token,
      expires_at: expiresAt.toISOString()
    }
  }

  private formatUser(user: any): User {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url || user.avatarUrl,
      email_verified: user.email_verified || user.emailVerified,
      created_at: user.created_at || user.createdAt,
      updated_at: user.updated_at || user.updatedAt
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isValidPassword(password: string): boolean {
    return password.length >= 8
  }

  private generateSecureToken(): string {
    return randomBytes(32).toString('hex')
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }

  private buildOAuthUrl(provider: 'google' | 'github', state: string): string {
    const providers = {
      google: {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        clientId: process.env.GOOGLE_CLIENT_ID!,
        scope: 'openid email profile'
      },
      github: {
        authUrl: 'https://github.com/login/oauth/authorize',
        clientId: process.env.GITHUB_CLIENT_ID!,
        scope: 'read:user user:email'
      }
    }

    const config = providers[provider]
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/oauth/callback`

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: config.scope,
      state,
      access_type: 'offline',
      prompt: 'consent'
    })

    return `${config.authUrl}?${params.toString()}`
  }

  private async exchangeOAuthCode(provider: string, code: string): Promise<any> {
    // Implementation depends on provider
    // This is a simplified version
    const providers = {
      google: {
        tokenUrl: 'https://oauth2.googleapis.com/token',
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!
      },
      github: {
        tokenUrl: 'https://github.com/login/oauth/access_token',
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!
      }
    }

    const config = providers[provider as keyof typeof providers]
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/oauth/callback`

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: config.clientId,
        client_secret: config.clientSecret
      })
    })

    return await response.json()
  }

  private async getOAuthUserInfo(provider: string, accessToken: string): Promise<any> {
    const urls = {
      google: 'https://www.googleapis.com/oauth2/v2/userinfo',
      github: 'https://api.github.com/user'
    }

    const response = await fetch(urls[provider as keyof typeof urls], {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    const data = await response.json()

    // Normalize response
    return {
      id: data.id || data.sub,
      email: data.email,
      name: data.name,
      picture: data.picture || data.avatar_url
    }
  }

  private async storeOAuthState(state: string, data: any): Promise<void> {
    // Store in database or Redis
    // For now, using Supabase
    const { error } = await this.supabase
      .from('oauth_states')
      .insert({
        state,
        data,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
      })

    if (error) throw error
  }

  private async validateOAuthState(state: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('oauth_states')
      .select('data')
      .eq('state', state)
      .single()

    if (error) return null

    // Delete after use
    await this.supabase
      .from('oauth_states')
      .delete()
      .eq('state', state)

    return data?.data
  }

  private async sendMagicLinkEmail(email: string, token: string): Promise<void> {
    // Implementation depends on email service
    // For now, log to console
    console.log(`Magic link for ${email}: ${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify?token=${token}`)
  }

  private async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    // Implementation depends on email service
    // For now, log to console
    console.log(`Password reset for ${email}: ${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${token}`)
  }

  private async syncUserToSupabase(user: any): Promise<void> {
    try {
      // Check if mapping exists
      const mapping = await this.getUserMapping(user.id)
      
      if (!mapping) {
        // Create user in Supabase auth
        const { data, error } = await this.supabase.auth.admin.createUser({
          email: user.email,
          email_confirm: user.email_verified,
          user_metadata: {
            name: user.name,
            avatar_url: user.avatar_url
          }
        })

        if (data?.user) {
          // Create mapping
          await this.createUserMapping(data.user.id, user.id)
        }
      }
    } catch (error) {
      console.error('Sync to Supabase failed:', error)
    }
  }

  private async deleteSupabaseUser(supabaseUserId: string): Promise<void> {
    try {
      await this.supabase.auth.admin.deleteUser(supabaseUserId)
    } catch (error) {
      console.error('Delete from Supabase failed:', error)
    }
  }

  private async getUserMapping(bestAuthUserId: string): Promise<any> {
    const { data } = await this.supabase
      .from('user_id_mapping')
      .select('*')
      .eq('bestauth_user_id', bestAuthUserId)
      .single()

    return data
  }

  private async createUserMapping(supabaseUserId: string, bestAuthUserId: string): Promise<void> {
    await this.supabase
      .from('user_id_mapping')
      .insert({
        supabase_user_id: supabaseUserId,
        bestauth_user_id: bestAuthUserId
      })
  }

  private async logSyncOperation(
    operationType: string,
    sourceSystem: string,
    targetSystem: string,
    entityId: string,
    status: string,
    errorMessage?: string
  ): Promise<void> {
    await this.supabase
      .from('sync_operations')
      .insert({
        operation_type: operationType,
        source_system: sourceSystem,
        target_system: targetSystem,
        entity_type: 'user',
        entity_id: entityId,
        status,
        error_message: errorMessage
      })
  }
}

// Export singleton instance
export const bestAuthService = new BestAuthService()