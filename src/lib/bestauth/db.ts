// BestAuth Database Client
import { createClient } from '@supabase/supabase-js'
import type { User, Session, OAuthAccount } from './types'

// Initialize Supabase client with service role for auth operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export const db = {
  // User operations
  users: {
    async findByEmail(email: string): Promise<User | null> {
      const { data, error } = await supabase
        .from('bestauth_users')
        .select('*')
        .eq('email', email)
        .single()
      
      if (error || !data) return null
      
      return {
        id: data.id,
        email: data.email,
        emailVerified: data.email_verified,
        name: data.name,
        avatarUrl: data.avatar_url,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      }
    },

    async findById(id: string): Promise<User | null> {
      const { data, error } = await supabase
        .from('bestauth_users')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error || !data) return null
      
      return {
        id: data.id,
        email: data.email,
        emailVerified: data.email_verified,
        name: data.name,
        avatarUrl: data.avatar_url,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      }
    },

    async create(userData: {
      email: string
      name?: string
      avatarUrl?: string
      emailVerified?: boolean
    }): Promise<User> {
      const { data, error } = await supabase
        .from('bestauth_users')
        .insert({
          email: userData.email,
          name: userData.name,
          avatar_url: userData.avatarUrl,
          email_verified: userData.emailVerified || false,
        })
        .select()
        .single()
      
      if (error) throw error
      
      return {
        id: data.id,
        email: data.email,
        emailVerified: data.email_verified,
        name: data.name,
        avatarUrl: data.avatar_url,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      }
    },

    async update(id: string, updates: Partial<User>): Promise<User> {
      const { data, error } = await supabase
        .from('bestauth_users')
        .update({
          name: updates.name,
          avatar_url: updates.avatarUrl,
          email_verified: updates.emailVerified,
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      return {
        id: data.id,
        email: data.email,
        emailVerified: data.email_verified,
        name: data.name,
        avatarUrl: data.avatar_url,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      }
    },
  },

  // Credentials operations
  credentials: {
    async findByUserId(userId: string): Promise<{ passwordHash: string } | null> {
      const { data, error } = await supabase
        .from('bestauth_credentials')
        .select('password_hash')
        .eq('user_id', userId)
        .single()
      
      if (error || !data) return null
      
      return { passwordHash: data.password_hash }
    },

    async create(userId: string, passwordHash: string): Promise<void> {
      const { error } = await supabase
        .from('bestauth_credentials')
        .insert({
          user_id: userId,
          password_hash: passwordHash,
        })
      
      if (error) throw error
    },

    async update(userId: string, passwordHash: string): Promise<void> {
      const { error } = await supabase
        .from('bestauth_credentials')
        .update({ password_hash: passwordHash })
        .eq('user_id', userId)
      
      if (error) throw error
    },
  },

  // OAuth accounts operations
  oauthAccounts: {
    async findByProvider(
      provider: string,
      providerAccountId: string
    ): Promise<OAuthAccount | null> {
      const { data, error } = await supabase
        .from('bestauth_oauth_accounts')
        .select('*')
        .eq('provider', provider)
        .eq('provider_account_id', providerAccountId)
        .single()
      
      if (error || !data) return null
      
      return {
        id: data.id,
        userId: data.user_id,
        provider: data.provider as 'google' | 'github',
        providerAccountId: data.provider_account_id,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      }
    },

    async create(accountData: {
      userId: string
      provider: string
      providerAccountId: string
      accessToken?: string
      refreshToken?: string
      expiresAt?: Date
    }): Promise<void> {
      const { error } = await supabase
        .from('bestauth_oauth_accounts')
        .insert({
          user_id: accountData.userId,
          provider: accountData.provider,
          provider_account_id: accountData.providerAccountId,
          access_token: accountData.accessToken,
          refresh_token: accountData.refreshToken,
          expires_at: accountData.expiresAt?.toISOString(),
        })
      
      if (error) throw error
    },

    async update(
      id: string,
      updates: {
        accessToken?: string
        refreshToken?: string
        expiresAt?: Date
      }
    ): Promise<void> {
      const { error } = await supabase
        .from('bestauth_oauth_accounts')
        .update({
          access_token: updates.accessToken,
          refresh_token: updates.refreshToken,
          expires_at: updates.expiresAt?.toISOString(),
        })
        .eq('id', id)
      
      if (error) throw error
    },
  },

  // Session operations
  sessions: {
    async create(sessionData: {
      userId: string
      tokenHash: string
      expiresAt: Date
      ipAddress?: string
      userAgent?: string
    }): Promise<Session> {
      const { data, error } = await supabase
        .from('bestauth_sessions')
        .insert({
          user_id: sessionData.userId,
          token_hash: sessionData.tokenHash,
          expires_at: sessionData.expiresAt.toISOString(),
          ip_address: sessionData.ipAddress,
          user_agent: sessionData.userAgent,
        })
        .select()
        .single()
      
      if (error) throw error
      
      return {
        id: data.id,
        userId: data.user_id,
        tokenHash: data.token_hash,
        expiresAt: new Date(data.expires_at),
        ipAddress: data.ip_address,
        userAgent: data.user_agent,
        createdAt: new Date(data.created_at),
        lastAccessed: new Date(data.last_accessed),
      }
    },

    async findByTokenHash(tokenHash: string): Promise<Session | null> {
      const { data, error } = await supabase
        .from('bestauth_sessions')
        .select('*')
        .eq('token_hash', tokenHash)
        .single()
      
      if (error || !data) return null
      
      return {
        id: data.id,
        userId: data.user_id,
        tokenHash: data.token_hash,
        expiresAt: new Date(data.expires_at),
        ipAddress: data.ip_address,
        userAgent: data.user_agent,
        createdAt: new Date(data.created_at),
        lastAccessed: new Date(data.last_accessed),
      }
    },

    async updateLastAccessed(id: string): Promise<void> {
      const { error } = await supabase
        .from('bestauth_sessions')
        .update({ last_accessed: new Date().toISOString() })
        .eq('id', id)
      
      if (error) throw error
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase
        .from('bestauth_sessions')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },

    async deleteByUserId(userId: string): Promise<void> {
      const { error } = await supabase
        .from('bestauth_sessions')
        .delete()
        .eq('user_id', userId)
      
      if (error) throw error
    },
  },

  // Magic links operations
  magicLinks: {
    async create(email: string, tokenHash: string, expiresAt: Date): Promise<void> {
      const { error } = await supabase
        .from('bestauth_magic_links')
        .insert({
          email,
          token_hash: tokenHash,
          expires_at: expiresAt.toISOString(),
        })
      
      if (error) throw error
    },

    async findByTokenHash(tokenHash: string): Promise<{ email: string; used: boolean } | null> {
      const { data, error } = await supabase
        .from('bestauth_magic_links')
        .select('email, used')
        .eq('token_hash', tokenHash)
        .gt('expires_at', new Date().toISOString())
        .single()
      
      if (error || !data) return null
      
      return { email: data.email, used: data.used }
    },

    async markAsUsed(tokenHash: string): Promise<void> {
      const { error } = await supabase
        .from('bestauth_magic_links')
        .update({ used: true })
        .eq('token_hash', tokenHash)
      
      if (error) throw error
    },
  },

  // Password reset operations
  passwordResets: {
    async create(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
      const { error } = await supabase
        .from('bestauth_password_resets')
        .insert({
          user_id: userId,
          token_hash: tokenHash,
          expires_at: expiresAt.toISOString(),
        })
      
      if (error) throw error
    },

    async findByTokenHash(tokenHash: string): Promise<{ userId: string; used: boolean } | null> {
      const { data, error } = await supabase
        .from('bestauth_password_resets')
        .select('user_id, used')
        .eq('token_hash', tokenHash)
        .gt('expires_at', new Date().toISOString())
        .single()
      
      if (error || !data) return null
      
      return { userId: data.user_id, used: data.used }
    },

    async markAsUsed(tokenHash: string): Promise<void> {
      const { error } = await supabase
        .from('bestauth_password_resets')
        .update({ used: true })
        .eq('token_hash', tokenHash)
      
      if (error) throw error
    },
  },

  // Activity logs
  activityLogs: {
    async create(logData: {
      userId?: string
      action: string
      ipAddress?: string
      userAgent?: string
      metadata?: any
    }): Promise<void> {
      const { error } = await supabase
        .from('bestauth_activity_logs')
        .insert({
          user_id: logData.userId,
          action: logData.action,
          ip_address: logData.ipAddress,
          user_agent: logData.userAgent,
          metadata: logData.metadata,
        })
      
      if (error) throw error
    },
  },
}