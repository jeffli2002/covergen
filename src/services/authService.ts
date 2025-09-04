import { supabase } from '@/lib/supabase'

let authServiceInstance: AuthService | null = null

class AuthService {
  private user: any = null
  private session: any = null
  private initialized = false
  private authSubscription: any = null
  private onAuthChange: ((user: any) => void) | null = null
  private initPromise: Promise<boolean> | null = null
  private sessionRefreshInterval: NodeJS.Timeout | null = null
  private sessionRefreshInProgress = false
  private lastSessionCheck: number | null = null

  constructor() {
    if (authServiceInstance) {
      return authServiceInstance
    }
    authServiceInstance = this
  }

  async initialize() {
    if (this.initialized) {
      return true
    }

    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = this._doInitialize()
    return this.initPromise
  }

  private async _doInitialize() {
    try {
      if (!supabase) {
        this.initialized = true
        return false
      }

      // Let Supabase handle everything - it will detect OAuth tokens automatically
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (session) {
        this.session = session
        this.user = session.user
        this.storeSession(session)
      }

      this.initialized = true

      if (!this.authSubscription) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          this.session = session
          this.user = session?.user || null
          this.lastSessionCheck = Date.now()

          if (session) {
            this.storeSession(session)
          } else {
            this.clearStoredSession()
          }

          if (this.onAuthChange) {
            this.onAuthChange(this.user)
          }

          if (event === 'SIGNED_IN' && session) {
            await this.onSignIn(session.user)
            this.startSessionRefreshTimer()
          } else if (event === 'SIGNED_OUT') {
            this.stopSessionRefreshTimer()
            this.onSignOut()
          } else if (event === 'TOKEN_REFRESHED') {
            this.lastSessionCheck = Date.now()
            if (session) {
              this.storeSession(session)
            }
          } else if (event === 'USER_UPDATED') {
            await this.syncUserData()
          }
        })
        this.authSubscription = subscription
      }

      if (this.user) {
        this.startSessionRefreshTimer()
      }

      return true
    } catch (error) {
      console.error('Error initializing auth:', error)
      return false
    }
  }

  async signUp(email: string, password: string, metadata: any = {}) {
    const maxRetries = 3
    let lastError: any = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: metadata.fullName || '',
              role: metadata.role || 'user',
              avatar_url: metadata.avatarUrl || ''
            }
          }
        })

        if (error) {
          if (error.message?.includes('already registered') || 
              error.message?.includes('invalid') ||
              error.message?.includes('weak password')) {
            throw error
          }
          lastError = error
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
            continue
          }
          throw error
        }

        return {
          success: true,
          user: data.user,
          session: data.session,
          message: 'Account created successfully! Please check your email to verify your account.'
        }
      } catch (error: any) {
        if (attempt === maxRetries) {
          return {
            success: false,
            error: error.message || lastError?.message || 'Failed to create account'
          }
        }
      }
    }

    return { success: false, error: 'Failed to create account' }
  }

  async signIn(email: string, password: string) {
    const maxRetries = 3
    let lastError: any = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          if (error.message?.includes('Invalid login credentials') || 
              error.message?.includes('Email not confirmed')) {
            throw error
          }
          lastError = error
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
            continue
          }
          throw error
        }

        if (data.session) {
          this.storeSession(data.session)
        }
        this.startSessionRefreshTimer()

        return {
          success: true,
          user: data.user,
          session: data.session
        }
      } catch (error: any) {
        if (attempt === maxRetries) {
          return {
            success: false,
            error: error.message || lastError?.message || 'Failed to sign in'
          }
        }
      }
    }

    return { success: false, error: 'Failed to sign in' }
  }

  async signInWithGoogle() {
    try {
      if (!supabase) {
        throw new Error('Supabase not configured')
      }

      // Get redirect URL from browser or environment
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/en` 
        : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/en`
      
      // Simple OAuth like production - let Supabase handle everything
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            // Force account selection to allow switching accounts
            prompt: 'select_account',
            access_type: 'offline'
          }
        }
      })

      if (error) {
        throw error
      }

      return {
        success: true,
        data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      return {
        success: true
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        throw error
      }

      return {
        success: true,
        message: 'Password reset email sent! Please check your inbox.'
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        throw error
      }

      return {
        success: true,
        message: 'Password updated successfully!'
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  getCurrentUser() {
    return this.user
  }

  getCurrentSession() {
    return this.session
  }

  async setSessionFromTokens(accessToken: string, refreshToken: string) {
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })

      if (error) throw error
      
      if (data.session) {
        this.storeSession(data.session)
        this.session = data.session
        this.user = data.user
        
        if (this.onAuthChange) {
          await this.onAuthChange(data.user)
        }
      }

      return { success: true, session: data.session }
    } catch (error: any) {
      console.error('Failed to set session from tokens:', error)
      return { success: false, error: error.message }
    }
  }

  async waitForAuth() {
    if (!this.initialized) {
      await this.initialize()
    }

    if (!this.user) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return this.user
  }

  isAuthenticated() {
    return !!this.user
  }

  async getUserUsageToday() {
    if (!this.user) return 0

    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // First check if table exists with a simple count
      const { error: tableError } = await supabase
        .from('user_usage')
        .select('*', { count: 'exact', head: true })
        .limit(1)

      if (tableError) {
        // Table doesn't exist or no access - return 0
        return 0
      }

      const { data, error } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', this.user.id)
        .gte('date', today.toISOString())
        .single()

      if (error) {
        // No data for today - return 0
        return 0
      }

      // Try different possible column names
      return data?.generation_count || data?.usage_count || data?.count || 0
    } catch (error) {
      // Silently fail - usage tracking is optional
      return 0
    }
  }

  async incrementUsage() {
    if (!this.user) return { success: false, error: 'Not authenticated' }

    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { error } = await supabase.rpc('increment_user_usage', {
        p_user_id: this.user.id,
        p_date: today.toISOString()
      })

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error incrementing usage:', error)
      return { success: false, error: error.message }
    }
  }

  async getUserSubscription() {
    if (!this.user) return null

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', this.user.id)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error getting subscription:', error)
      return null
    }
  }

  setAuthChangeHandler(handler: (user: any) => void) {
    this.onAuthChange = handler
  }

  private async onSignIn(user: any) {
    const maxRetries = 3

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            updated_at: new Date().toISOString()
          }, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          })

        if (upsertError) {
          console.error(`Profile upsert attempt ${attempt} failed:`, upsertError)
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
            continue
          }
        }
        break
      } catch (error) {
        console.error(`Error upserting profile (attempt ${attempt}):`, error)
      }
    }
  }

  private onSignOut() {
    this.user = null
    this.session = null
    this.clearStoredSession()
  }

  private async syncUserData() {
    if (!this.user) return

    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error) {
        console.error('Error fetching user data:', error)
        return
      }

      if (user) {
        this.user = user
      }
    } catch (error) {
      console.error('Error syncing user data:', error)
    }
  }

  private storeSession(session: any) {
    if (!session) return

    try {
      const sessionData = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        expires_in: session.expires_in,
        token_type: session.token_type,
        user: session.user
      }
      localStorage.setItem('coverimage_session', JSON.stringify(sessionData))
    } catch (error) {
      console.error('Error storing session:', error)
    }
  }

  private getStoredSession() {
    try {
      const stored = localStorage.getItem('coverimage_session')
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Error retrieving stored session:', error)
      return null
    }
  }

  private clearStoredSession() {
    try {
      localStorage.removeItem('coverimage_session')
    } catch (error) {
      console.error('Error clearing stored session:', error)
    }
  }

  private isSessionValid(session: any) {
    if (!session || !session.expires_at) return false

    const expiresAt = new Date(session.expires_at * 1000)
    const now = new Date()
    const hasExpired = now >= expiresAt

    if (hasExpired) {
      return false
    }

    return !!(session.access_token && session.refresh_token)
  }

  private startSessionRefreshTimer() {
    this.stopSessionRefreshTimer()

    this.sessionRefreshInterval = setInterval(async () => {
      if (this.user && this.session) {
        if (this.sessionNeedsRefresh()) {
          await this.refreshSession()
        }

        const thirtyMinutes = 30 * 60 * 1000
        const timeSinceLastCheck = Date.now() - (this.lastSessionCheck || 0)
        if (timeSinceLastCheck >= thirtyMinutes) {
          await this.refreshSession()
        }
      }
    }, 60 * 1000)
  }

  private stopSessionRefreshTimer() {
    if (this.sessionRefreshInterval) {
      clearInterval(this.sessionRefreshInterval)
      this.sessionRefreshInterval = null
    }
  }

  private sessionNeedsRefresh() {
    const expiryTime = this.getSessionExpiryTime()
    if (!expiryTime) return false

    const now = Date.now()
    const timeUntilExpiry = expiryTime - now
    const fiveMinutes = 5 * 60 * 1000

    return timeUntilExpiry <= fiveMinutes
  }

  private getSessionExpiryTime() {
    if (!this.session?.expires_at) return null
    return new Date(this.session.expires_at * 1000).getTime()
  }

  private async refreshSession() {
    if (this.sessionRefreshInProgress) {
      return { session: this.session, error: null }
    }

    this.sessionRefreshInProgress = true

    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()

      if (error) {
        if (error.message?.includes('invalid') || error.message?.includes('expired')) {
          const { data: { session: newSession }, error: sessionError } = await supabase.auth.getSession()

          if (newSession) {
            this.session = newSession
            this.user = newSession.user
            this.lastSessionCheck = Date.now()
            this.storeSession(newSession)
            if (this.onAuthChange) {
              this.onAuthChange(this.user)
            }
            return { session: newSession, error: null }
          }
        }
        throw error
      }

      if (session?.user) {
        this.session = session
        this.user = session.user
        this.lastSessionCheck = Date.now()
        this.storeSession(session)
        if (this.onAuthChange) {
          this.onAuthChange(this.user)
        }
      }

      return { session, error }
    } catch (error) {
      console.error('Error refreshing session:', error)
      return { session: null, error }
    } finally {
      this.sessionRefreshInProgress = false
    }
  }

  destroy() {
    this.stopSessionRefreshTimer()
    if (this.authSubscription) {
      this.authSubscription.unsubscribe()
      this.authSubscription = null
    }
    this.initialized = false
    authServiceInstance = null
  }
}

export default new AuthService()