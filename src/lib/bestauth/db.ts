// BestAuth Database Client
import { getBestAuthSupabaseClient } from './db-client'
import type { User, Session, OAuthAccount } from './types'
import { getSubscriptionConfig } from '@/lib/subscription-config'

// Helper to get database client with error handling
function getDb() {
  const client = getBestAuthSupabaseClient()
  if (!client) {
    throw new Error('BestAuth: Database connection not available. Check environment variables.')
  }
  return client
}

export const db = {
  // User operations
  users: {
    async findByEmail(email: string): Promise<User | null> {
      try {
        const { data, error } = await getDb()
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
      } catch (error) {
        console.error('Error finding user by email:', error)
        return null
      }
    },

    async findById(id: string): Promise<User | null> {
      const { data, error } = await getDb()
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
      const { data, error } = await getDb()
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
      const { data, error } = await getDb()
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
      const { data, error } = await getDb()
        .from('bestauth_credentials')
        .select('password_hash')
        .eq('user_id', userId)
        .single()
      
      if (error || !data) return null
      
      return { passwordHash: data.password_hash }
    },

    async create(userId: string, passwordHash: string): Promise<void> {
      const { error } = await getDb()
        .from('bestauth_credentials')
        .insert({
          user_id: userId,
          password_hash: passwordHash,
        })
      
      if (error) throw error
    },

    async update(userId: string, passwordHash: string): Promise<void> {
      const { error } = await getDb()
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
      const { data, error } = await getDb()
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
      const { error } = await getDb()
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
      const { error } = await getDb()
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
      const { data, error } = await getDb()
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
      const { data, error } = await getDb()
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
      const { error } = await getDb()
        .from('bestauth_sessions')
        .update({ last_accessed: new Date().toISOString() })
        .eq('id', id)
      
      if (error) throw error
    },

    async findById(id: string): Promise<Session | null> {
      const { data, error } = await getDb()
        .from('bestauth_sessions')
        .select('*')
        .eq('id', id)
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

    async delete(id: string): Promise<void> {
      const { error } = await getDb()
        .from('bestauth_sessions')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },

    async deleteByUserId(userId: string): Promise<void> {
      const { error } = await getDb()
        .from('bestauth_sessions')
        .delete()
        .eq('user_id', userId)
      
      if (error) throw error
    },
  },

  // Magic links operations
  magicLinks: {
    async create(email: string, tokenHash: string, expiresAt: Date): Promise<void> {
      const { error } = await getDb()
        .from('bestauth_magic_links')
        .insert({
          email,
          token_hash: tokenHash,
          expires_at: expiresAt.toISOString(),
        })
      
      if (error) throw error
    },

    async findByTokenHash(tokenHash: string): Promise<{ email: string; used: boolean; expiresAt: Date } | null> {
      const { data, error } = await getDb()
        .from('bestauth_magic_links')
        .select('email, used, expires_at')
        .eq('token_hash', tokenHash)
        .gt('expires_at', new Date().toISOString())
        .single()
      
      if (error || !data) return null
      
      return { email: data.email, used: data.used, expiresAt: new Date(data.expires_at) }
    },

    async markAsUsed(tokenHash: string): Promise<void> {
      const { error } = await getDb()
        .from('bestauth_magic_links')
        .update({ used: true })
        .eq('token_hash', tokenHash)
      
      if (error) throw error
    },
  },

  // Password reset operations
  passwordResets: {
    async create(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
      const { error } = await getDb()
        .from('bestauth_password_resets')
        .insert({
          user_id: userId,
          token_hash: tokenHash,
          expires_at: expiresAt.toISOString(),
        })
      
      if (error) throw error
    },

    async findByTokenHash(tokenHash: string): Promise<{ userId: string; used: boolean; expiresAt: Date } | null> {
      const { data, error } = await getDb()
        .from('bestauth_password_resets')
        .select('user_id, used, expires_at')
        .eq('token_hash', tokenHash)
        .gt('expires_at', new Date().toISOString())
        .single()
      
      if (error || !data) return null
      
      return { userId: data.user_id, used: data.used, expiresAt: new Date(data.expires_at) }
    },

    async markAsUsed(tokenHash: string): Promise<void> {
      const { error } = await getDb()
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
      const { error } = await getDb()
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

  // Subscription operations
  subscriptions: {
    async findByUserId(userId: string): Promise<any | null> {
      const { data, error } = await getDb()
        .from('bestauth_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error || !data) return null
      
      return data
    },

    async create(subscriptionData: {
      userId: string
      tier?: string
      status?: string
      stripeCustomerId?: string
      stripeSubscriptionId?: string
      stripePriceId?: string
      trialStartedAt?: Date
      trialEndsAt?: Date
      currentPeriodStart?: Date
      currentPeriodEnd?: Date
      metadata?: any
    }): Promise<any> {
      const { data, error } = await getDb()
        .from('bestauth_subscriptions')
        .insert({
          user_id: subscriptionData.userId,
          tier: subscriptionData.tier || 'free',
          status: subscriptionData.status || 'active',
          stripe_customer_id: subscriptionData.stripeCustomerId,
          stripe_subscription_id: subscriptionData.stripeSubscriptionId,
          stripe_price_id: subscriptionData.stripePriceId,
          trial_started_at: subscriptionData.trialStartedAt?.toISOString(),
          trial_ends_at: subscriptionData.trialEndsAt?.toISOString(),
          current_period_start: subscriptionData.currentPeriodStart?.toISOString(),
          current_period_end: subscriptionData.currentPeriodEnd?.toISOString(),
          metadata: subscriptionData.metadata,
        })
        .select()
        .single()
      
      if (error) throw error
      
      return data
    },

    async update(userId: string, updates: {
      tier?: string
      status?: string
      stripeCustomerId?: string
      stripeSubscriptionId?: string
      stripePriceId?: string
      stripePaymentMethodId?: string
      trialEndedAt?: Date
      trialEndsAt?: Date
      currentPeriodStart?: Date
      currentPeriodEnd?: Date
      cancelAtPeriodEnd?: boolean
      cancelAt?: Date
      cancelledAt?: Date
      expiresAt?: Date
      metadata?: any
    }): Promise<any> {
      const updateData: any = {}
      
      if (updates.tier !== undefined) updateData.tier = updates.tier
      if (updates.status !== undefined) updateData.status = updates.status
      if (updates.stripeCustomerId !== undefined) updateData.stripe_customer_id = updates.stripeCustomerId
      if (updates.stripeSubscriptionId !== undefined) updateData.stripe_subscription_id = updates.stripeSubscriptionId
      if (updates.stripePriceId !== undefined) updateData.stripe_price_id = updates.stripePriceId
      if (updates.stripePaymentMethodId !== undefined) updateData.stripe_payment_method_id = updates.stripePaymentMethodId
      if (updates.trialEndedAt !== undefined) updateData.trial_ended_at = updates.trialEndedAt?.toISOString()
      if (updates.trialEndsAt !== undefined) updateData.trial_ends_at = updates.trialEndsAt?.toISOString()
      if (updates.currentPeriodStart !== undefined) updateData.current_period_start = updates.currentPeriodStart?.toISOString()
      if (updates.currentPeriodEnd !== undefined) updateData.current_period_end = updates.currentPeriodEnd?.toISOString()
      if (updates.cancelAtPeriodEnd !== undefined) updateData.cancel_at_period_end = updates.cancelAtPeriodEnd
      if (updates.cancelAt !== undefined) updateData.cancel_at = updates.cancelAt?.toISOString()
      if (updates.cancelledAt !== undefined) updateData.cancelled_at = updates.cancelledAt?.toISOString()
      if (updates.expiresAt !== undefined) updateData.expires_at = updates.expiresAt?.toISOString()
      if (updates.metadata !== undefined) updateData.metadata = updates.metadata
      
      const { data, error } = await getDb()
        .from('bestauth_subscriptions')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single()
      
      if (error) throw error
      
      return data
    },

    async upsert(subscriptionData: any): Promise<any> {
      const { data, error } = await getDb()
        .from('bestauth_subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'user_id'
        })
        .select()
        .single()
      
      if (error) throw error
      
      return data
    },

    async getStatus(userId: string): Promise<any | null> {
      try {
        // Get subscription data directly from table instead of RPC
        const { data, error } = await getDb()
          .from('bestauth_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single()
        
        if (error || !data) return null
        
        // Get usage data safely - avoid circular reference by calling directly
        let usageToday = 0
        try {
          const { data: usageData, error: usageError } = await getDb()
            .from('bestauth_usage_tracking')
            .select('generation_count')
            .eq('user_id', userId)
            .eq('date', new Date().toISOString().split('T')[0])
            .single()
          
          // Check if error is table not found
          if (usageError && (usageError.code === 'PGRST116' || usageError.message?.includes('relation'))) {
            console.warn('Usage tracking table not found, usage tracking disabled')
            usageToday = 0
          } else if (!usageError) {
            usageToday = usageData?.generation_count || 0
          } else {
            console.error('Usage tracking error:', usageError)
            usageToday = 0
          }
        } catch (error) {
          // Silently handle usage table not existing
          console.warn('Usage tracking unavailable:', error)
          usageToday = 0
        }
        
        // Return data in the expected format
        return {
          subscription_id: data.id,
          user_id: data.user_id,
          tier: data.tier || 'free',
          status: data.status || 'active',
          is_trialing: data.status === 'trialing',
          trial_days_remaining: data.trial_ends_at ? 
            Math.max(0, Math.ceil((new Date(data.trial_ends_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000))) : 0,
          can_generate: true, // TODO: Implement proper limit checking
          usage_today: usageToday,
          daily_limit: (() => {
            const config = getSubscriptionConfig()
            const tier = data.tier || 'free'
            const isTrialing = data.status === 'trialing'
            
            if (tier === 'free') {
              return config.limits.free.daily
            } else if (tier === 'pro') {
              return isTrialing ? config.limits.pro.trial_daily : config.limits.pro.monthly
            } else if (tier === 'pro_plus') {
              return isTrialing ? config.limits.pro_plus.trial_daily : config.limits.pro_plus.monthly
            }
            return config.limits.free.daily
          })(),
          monthly_limit: (() => {
            const config = getSubscriptionConfig()
            const tier = data.tier || 'free'
            
            if (tier === 'free') {
              return config.limits.free.monthly
            } else if (tier === 'pro') {
              return config.limits.pro.monthly
            } else if (tier === 'pro_plus') {
              return config.limits.pro_plus.monthly
            }
            return config.limits.free.monthly
          })(),
          has_payment_method: !!data.stripe_subscription_id,
          requires_payment_setup: data.status === 'trialing' && !data.stripe_subscription_id,
          next_billing_date: data.current_period_end || null
        }
      } catch (error) {
        console.error('Error getting subscription status:', error)
        return null
      }
    },
  },

  // Usage tracking operations
  usage: {
    async getToday(userId: string): Promise<number> {
      try {
        const { data, error } = await getDb()
          .from('bestauth_usage_tracking')
          .select('generation_count')
          .eq('user_id', userId)
          .eq('date', new Date().toISOString().split('T')[0])
          .single()
        
        // Handle table not found error (406/PGRST116) gracefully
        if (error) {
          if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
            console.warn('Usage tracking table not found, returning 0')
            return 0
          }
          console.error('Error getting usage today:', error)
          return 0
        }
        
        if (!data) return 0
        return data.generation_count || 0
      } catch (err) {
        console.error('Error getting usage today:', err)
        return 0
      }
    },

    async increment(userId: string, amount: number = 1): Promise<number> {
      try {
        const today = new Date().toISOString().split('T')[0]
        
        // Check if record exists for today
        const { data: existing, error: selectError } = await getDb()
          .from('bestauth_usage_tracking')
          .select('*')
          .eq('user_id', userId)
          .eq('date', today)
          .single()
        
        // Handle table not found gracefully
        if (selectError && (selectError.code === 'PGRST116' || selectError.message?.includes('relation'))) {
          console.warn('Usage tracking table not found, cannot increment usage')
          return amount // Return the amount as if it was incremented
        }
        
        let newCount: number
        
        if (existing) {
          // Update existing record
          const { data, error } = await getDb()
            .from('bestauth_usage_tracking')
            .update({ generation_count: (existing.generation_count || 0) + amount })
            .eq('user_id', userId)
            .eq('date', today)
            .select('generation_count')
            .single()
          
          if (error) {
            // Handle table errors gracefully
            if (error.code === 'PGRST116' || error.message?.includes('relation')) {
              console.warn('Usage tracking table not found during update')
              return (existing.generation_count || 0) + amount
            }
            throw error
          }
          newCount = data?.generation_count || 0
        } else {
          // Insert new record
          const { data, error } = await getDb()
            .from('bestauth_usage_tracking')
            .insert({ user_id: userId, date: today, generation_count: amount })
            .select('generation_count')
            .single()
          
          if (error) {
            // Handle table errors gracefully
            if (error.code === 'PGRST116' || error.message?.includes('relation')) {
              console.warn('Usage tracking table not found during insert')
              return amount
            }
            throw error
          }
          newCount = data?.generation_count || 0
        }
        
        return newCount
      } catch (err) {
        console.error('Error incrementing usage:', err)
        // Don't throw error - return a reasonable default
        return amount
      }
    },

    async checkLimit(userId: string): Promise<boolean> {
      try {
        const config = getSubscriptionConfig()
        const todayUsage = await this.getToday(userId)
        const subscription = await db.subscriptions.findByUserId(userId)
        
        if (!subscription) {
          // Free tier: use config limit
          return todayUsage < config.limits.free.daily
        }
        
        // Check based on subscription tier and status
        const tier = subscription.tier || 'free'
        const isTrialing = subscription.status === 'trialing'
        
        if (tier === 'free') {
          return todayUsage < config.limits.free.daily
        } else if (tier === 'pro') {
          if (isTrialing) {
            // Pro trial: daily limit
            return todayUsage < config.limits.pro.trial_daily
          } else {
            // Pro paid: check monthly limit (simplified to daily equivalent)
            const monthlyUsage = await this.getMonthlyUsage(userId)
            return monthlyUsage < config.limits.pro.monthly
          }
        } else if (tier === 'pro_plus') {
          if (isTrialing) {
            // Pro+ trial: daily limit
            return todayUsage < config.limits.pro_plus.trial_daily
          } else {
            // Pro+ paid: check monthly limit (simplified to daily equivalent)
            const monthlyUsage = await this.getMonthlyUsage(userId)
            return monthlyUsage < config.limits.pro_plus.monthly
          }
        }
        
        // Default to free tier limits
        return todayUsage < config.limits.free.daily
      } catch (err) {
        console.error('Error checking limit:', err)
        return true // Allow on error
      }
    },

    async getMonthlyUsage(userId: string): Promise<number> {
      try {
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)
        
        const { data, error } = await getDb()
          .from('bestauth_usage_tracking')
          .select('generation_count')
          .eq('user_id', userId)
          .gte('date', startOfMonth.toISOString().split('T')[0])
        
        // Handle table not found error gracefully
        if (error) {
          if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
            console.warn('Usage tracking table not found, returning 0 for monthly usage')
            return 0
          }
          console.error('Error getting monthly usage:', error)
          return 0
        }
        
        if (!data) return 0
        
        return data.reduce((sum, record) => sum + (record.generation_count || 0), 0)
      } catch (err) {
        console.error('Error getting monthly usage:', err)
        return 0
      }
    },
  },

  // User profile operations
  profiles: {
    async findByUserId(userId: string): Promise<any | null> {
      const { data, error } = await getDb()
        .from('bestauth_user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error || !data) return null
      
      return data
    },

    async upsert(profileData: {
      userId: string
      fullName?: string
      avatarUrl?: string
      phone?: string
      address?: any
      metadata?: any
    }): Promise<any> {
      const { data, error } = await getDb()
        .from('bestauth_user_profiles')
        .upsert({
          user_id: profileData.userId,
          full_name: profileData.fullName,
          avatar_url: profileData.avatarUrl,
          phone: profileData.phone,
          address: profileData.address,
          metadata: profileData.metadata,
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single()
      
      if (error) throw error
      
      return data
    },
  },

  // Payment history operations
  payments: {
    async create(paymentData: {
      userId: string
      stripePaymentIntentId?: string
      stripeInvoiceId?: string
      amount: number
      currency?: string
      status: string
      description?: string
      metadata?: any
    }): Promise<any> {
      const { data, error } = await getDb()
        .from('bestauth_payment_history')
        .insert({
          user_id: paymentData.userId,
          stripe_payment_intent_id: paymentData.stripePaymentIntentId,
          stripe_invoice_id: paymentData.stripeInvoiceId,
          amount: paymentData.amount,
          currency: paymentData.currency || 'USD',
          status: paymentData.status,
          description: paymentData.description,
          metadata: paymentData.metadata,
        })
        .select()
        .single()
      
      if (error) throw error
      
      return data
    },

    async findByUserId(userId: string, limit: number = 10): Promise<any[]> {
      const { data, error } = await getDb()
        .from('bestauth_payment_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      
      return data || []
    },

    async findByInvoiceId(invoiceId: string): Promise<any | null> {
      const { data, error } = await getDb()
        .from('bestauth_payment_history')
        .select('*')
        .eq('stripe_invoice_id', invoiceId)
        .single()
      
      if (error || !data) return null
      
      return data
    },
  },
}