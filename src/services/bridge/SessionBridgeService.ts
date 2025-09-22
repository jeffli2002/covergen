import { createClient } from '@/lib/supabase'
import { db } from '@/lib/bestauth/db'
import { cookies } from 'next/headers'
import { createHash } from 'crypto'
import { bestAuthService } from '@/services/auth/BestAuthService'
import { userSyncService } from '@/services/sync/UserSyncService'

export interface UnifiedUser {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  email_verified: boolean
  source: 'bestauth' | 'supabase'
}

export interface UnifiedSession {
  id: string
  user: UnifiedUser
  bestauth_session_id?: string
  supabase_session_id?: string
  expires_at: string
  created_at: string
}

export interface SupabaseSession {
  access_token: string
  refresh_token: string
  user: any
  expires_at?: number
}

export interface BestAuthSession {
  id: string
  token: string
  user_id: string
  expires_at: Date
}

export class SessionBridgeService {
  private supabase = createClient()

  /**
   * Validate session from either BestAuth or Supabase
   */
  async validateSession(token: string): Promise<UnifiedSession | null> {
    try {
      // First, try to validate as BestAuth session
      const bestAuthResult = await bestAuthService.validateSession(token)
      
      if (bestAuthResult.success && bestAuthResult.data) {
        // Get or create unified session
        const unifiedSession = await this.getOrCreateUnifiedSession(
          bestAuthResult.data,
          'bestauth'
        )
        return unifiedSession
      }

      // If not a BestAuth session, try Supabase
      const { data: { session: supabaseSession }, error } = await this.supabase.auth.getSession()
      
      if (!error && supabaseSession) {
        // Ensure user exists in BestAuth
        const syncResult = await userSyncService.syncUser(supabaseSession.user.id)
        
        if (syncResult.success && syncResult.userId) {
          const bestAuthUser = await db.users.findById(syncResult.userId)
          if (bestAuthUser) {
            const unifiedSession = await this.getOrCreateUnifiedSession(
              this.formatUser(bestAuthUser, 'supabase'),
              'supabase',
              supabaseSession.access_token
            )
            return unifiedSession
          }
        }
      }

      return null
    } catch (error) {
      console.error('validateSession error:', error)
      return null
    }
  }

  /**
   * Create a unified session for a user
   */
  async createUnifiedSession(
    user: UnifiedUser,
    source: 'bestauth' | 'supabase'
  ): Promise<UnifiedSession> {
    try {
      const sessionId = this.generateSessionId()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      let bestAuthSessionId: string | undefined
      let supabaseSessionId: string | undefined

      if (source === 'bestauth') {
        // Create BestAuth session
        const session = await db.sessions.create({
          id: sessionId,
          userId: user.id,
          tokenHash: this.hashToken(sessionId),
          expiresAt
        })
        bestAuthSessionId = session.id

        // Also ensure user exists in Supabase for compatibility
        await userSyncService.syncBestAuthUserToSupabase(user.id)
      } else {
        // Source is Supabase, ensure BestAuth user exists
        const mapping = await userSyncService.getUserMapping(user.id)
        if (mapping) {
          const session = await db.sessions.create({
            id: sessionId,
            userId: mapping,
            tokenHash: this.hashToken(sessionId),
            expiresAt
          })
          bestAuthSessionId = session.id
        }
        supabaseSessionId = user.id // In this case, user.id is the Supabase user ID
      }

      // Create unified session record
      const { data: unifiedSession, error } = await this.supabase
        .from('unified_sessions')
        .insert({
          id: sessionId,
          bestauth_session_id: bestAuthSessionId,
          supabase_session_id: supabaseSessionId,
          user_id: source === 'bestauth' ? user.id : mapping,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Set session cookies
      await this.setSessionCookies(sessionId, expiresAt)

      return {
        id: sessionId,
        user,
        bestauth_session_id: bestAuthSessionId,
        supabase_session_id: supabaseSessionId,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      }
    } catch (error) {
      console.error('createUnifiedSession error:', error)
      throw error
    }
  }

  /**
   * Convert a Supabase session to BestAuth session
   */
  async convertSupabaseSessionToBestAuth(
    supabaseSession: SupabaseSession
  ): Promise<BestAuthSession> {
    try {
      // Sync user first
      const syncResult = await userSyncService.syncUser(supabaseSession.user.id)
      
      if (!syncResult.success || !syncResult.userId) {
        throw new Error('Failed to sync user')
      }

      // Create BestAuth session
      const sessionId = this.generateSessionId()
      const token = this.generateToken()
      const expiresAt = new Date(
        supabaseSession.expires_at
          ? supabaseSession.expires_at * 1000
          : Date.now() + 24 * 60 * 60 * 1000
      )

      const session = await db.sessions.create({
        id: sessionId,
        userId: syncResult.userId,
        tokenHash: this.hashToken(token),
        expiresAt
      })

      // Create unified session mapping
      await this.createSessionMapping(
        session.id,
        supabaseSession.access_token,
        syncResult.userId
      )

      return {
        id: session.id,
        token,
        user_id: syncResult.userId,
        expires_at: expiresAt
      }
    } catch (error) {
      console.error('convertSupabaseSessionToBestAuth error:', error)
      throw error
    }
  }

  /**
   * Convert a BestAuth session to Supabase session format
   */
  async convertBestAuthSessionToSupabase(
    bestAuthSession: BestAuthSession
  ): Promise<SupabaseSession> {
    try {
      // Get user mapping
      const { data: mapping } = await this.supabase
        .from('user_id_mapping')
        .select('supabase_user_id')
        .eq('bestauth_user_id', bestAuthSession.user_id)
        .single()

      if (!mapping) {
        // Create Supabase user if doesn't exist
        const syncResult = await userSyncService.syncBestAuthUserToSupabase(
          bestAuthSession.user_id
        )
        if (!syncResult.success) {
          throw new Error('Failed to sync user to Supabase')
        }
      }

      // Get Supabase user data
      const { data: supabaseUser } = await this.supabase.auth.admin.getUserById(
        mapping?.supabase_user_id || bestAuthSession.user_id
      )

      if (!supabaseUser) {
        throw new Error('Supabase user not found')
      }

      // Note: We can't create a real Supabase session from BestAuth,
      // but we can return a compatible structure for the bridge
      return {
        access_token: bestAuthSession.token,
        refresh_token: '', // Not available in BestAuth
        user: supabaseUser.user,
        expires_at: Math.floor(bestAuthSession.expires_at.getTime() / 1000)
      }
    } catch (error) {
      console.error('convertBestAuthSessionToSupabase error:', error)
      throw error
    }
  }

  /**
   * Sync session state between BestAuth and Supabase
   */
  async syncSessionState(sessionId: string): Promise<void> {
    try {
      // Get unified session
      const { data: unifiedSession } = await this.supabase
        .from('unified_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (!unifiedSession) {
        throw new Error('Unified session not found')
      }

      // Check BestAuth session validity
      if (unifiedSession.bestauth_session_id) {
        const bestAuthSession = await db.sessions.findById(
          unifiedSession.bestauth_session_id
        )
        
        if (!bestAuthSession || new Date(bestAuthSession.expiresAt) < new Date()) {
          // BestAuth session expired, invalidate unified session
          await this.invalidateUnifiedSession(sessionId)
          return
        }
      }

      // Update last accessed timestamp
      await this.supabase
        .from('unified_sessions')
        .update({
          last_accessed_at: new Date().toISOString()
        })
        .eq('id', sessionId)
    } catch (error) {
      console.error('syncSessionState error:', error)
    }
  }

  /**
   * Invalidate all sessions for a user
   */
  async invalidateAllSessions(userId: string): Promise<void> {
    try {
      // Delete BestAuth sessions
      await db.sessions.deleteByUserId(userId)

      // Get user mapping to find Supabase user ID
      const { data: mapping } = await this.supabase
        .from('user_id_mapping')
        .select('supabase_user_id')
        .eq('bestauth_user_id', userId)
        .single()

      if (mapping) {
        // Sign out from Supabase
        await this.supabase.auth.admin.deleteUser(mapping.supabase_user_id)
      }

      // Delete unified sessions
      await this.supabase
        .from('unified_sessions')
        .delete()
        .eq('user_id', userId)

      // Clear cookies
      const cookieStore = cookies()
      cookieStore.delete('bestauth-session')
      cookieStore.delete('sb-access-token')
      cookieStore.delete('sb-refresh-token')
    } catch (error) {
      console.error('invalidateAllSessions error:', error)
    }
  }

  // Private helper methods

  private async getOrCreateUnifiedSession(
    user: any,
    source: 'bestauth' | 'supabase',
    supabaseSessionId?: string
  ): Promise<UnifiedSession> {
    const formattedUser = this.formatUser(user, source)
    
    // Check if unified session already exists
    const { data: existingSession } = await this.supabase
      .from('unified_sessions')
      .select('*')
      .eq('user_id', formattedUser.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (existingSession && new Date(existingSession.expires_at) > new Date()) {
      return {
        id: existingSession.id,
        user: formattedUser,
        bestauth_session_id: existingSession.bestauth_session_id,
        supabase_session_id: existingSession.supabase_session_id,
        expires_at: existingSession.expires_at,
        created_at: existingSession.created_at
      }
    }

    // Create new unified session
    return await this.createUnifiedSession(formattedUser, source)
  }

  private formatUser(user: any, source: 'bestauth' | 'supabase'): UnifiedUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name || user.user_metadata?.name || null,
      avatar_url: user.avatar_url || user.avatarUrl || user.user_metadata?.avatar_url || null,
      email_verified: user.email_verified || user.emailVerified || !!user.email_confirmed_at,
      source
    }
  }

  private async createSessionMapping(
    bestAuthSessionId: string,
    supabaseSessionId: string,
    userId: string
  ): Promise<void> {
    await this.supabase
      .from('unified_sessions')
      .insert({
        bestauth_session_id: bestAuthSessionId,
        supabase_session_id: supabaseSessionId,
        user_id: userId,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
  }

  private async invalidateUnifiedSession(sessionId: string): Promise<void> {
    await this.supabase
      .from('unified_sessions')
      .delete()
      .eq('id', sessionId)
  }

  private async setSessionCookies(sessionId: string, expiresAt: Date): Promise<void> {
    const cookieStore = cookies()
    
    // Set unified session cookie
    cookieStore.set('unified-session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/'
    })
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateToken(): string {
    return require('crypto').randomBytes(32).toString('hex')
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }
}

// Export singleton instance
export const sessionBridgeService = new SessionBridgeService()