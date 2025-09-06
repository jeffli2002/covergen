import { authEventBus } from '../eventBus'
import { AuthEvent } from '../types'
import { getSupabaseBrowserClient } from '@/lib/supabase-singleton'

// Profile sync listener - completely decoupled from OAuth
export class ProfileSyncListener {
  private supabase = typeof window !== 'undefined' ? getSupabaseBrowserClient() : null
  private unsubscribe: (() => void) | null = null
  private static instance: ProfileSyncListener | null = null

  constructor() {
    if (ProfileSyncListener.instance) {
      return ProfileSyncListener.instance
    }
    ProfileSyncListener.instance = this
  }

  start() {
    if (this.unsubscribe) {
      console.log('[ProfileSync] Already started')
      return
    }

    console.log('[ProfileSync] Starting listener')
    
    // Listen for successful sign ins
    this.unsubscribe = authEventBus.on('auth:signin:success', async (event: AuthEvent) => {
      console.log('[ProfileSync] Received signin success event')
      
      if (event.user) {
        await this.syncProfile(event.user)
      }
    })
  }

  stop() {
    if (this.unsubscribe) {
      console.log('[ProfileSync] Stopping listener')
      this.unsubscribe()
      this.unsubscribe = null
    }
  }

  private async syncProfile(user: any) {
    if (!this.supabase) {
      console.warn('[ProfileSync] Supabase not available')
      return
    }

    const maxRetries = 3
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log('[ProfileSync] Syncing profile for user:', user.id)
        
        const profileData = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
          provider: user.app_metadata?.provider || 'email',
          updated_at: new Date().toISOString()
        }

        const { error } = await this.supabase
          .from('profiles')
          .upsert(profileData, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          })

        if (error) {
          console.error(`[ProfileSync] Upsert attempt ${attempt} failed:`, error)
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
            continue
          }
          throw error
        } else {
          console.log('[ProfileSync] Profile synced successfully')
          
          // Emit profile sync event
          await authEventBus.emit({
            type: 'auth:profile:sync',
            user,
            metadata: { profileData }
          })
          
          break
        }
      } catch (error) {
        console.error(`[ProfileSync] Error syncing profile (attempt ${attempt}):`, error)
        
        if (attempt === maxRetries) {
          // Final attempt failed, but don't break the auth flow
          console.error('[ProfileSync] All retry attempts failed, profile may not be synced')
        }
      }
    }
  }

  // Static method to get instance
  static getInstance(): ProfileSyncListener {
    if (!ProfileSyncListener.instance) {
      ProfileSyncListener.instance = new ProfileSyncListener()
    }
    return ProfileSyncListener.instance
  }
}

// Create and export singleton
export const profileSyncListener = ProfileSyncListener.getInstance()