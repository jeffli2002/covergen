import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/bestauth/db'
import { SupabaseClient } from '@supabase/supabase-js'

export interface SyncResult {
  success: boolean
  userId?: string
  error?: string
  details?: any
}

export interface BatchSyncResult {
  total: number
  successful: number
  failed: number
  errors: Array<{ userId: string; error: string }>
}

export interface AuthChangeEvent {
  event: 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED' | 'USER_DELETED'
  session: any
  user: any
}

export class UserSyncService {
  private supabase: SupabaseClient

  constructor() {
    this.supabase = createClient()
  }

  /**
   * Sync a single user from Supabase to BestAuth
   */
  async syncUser(supabaseUserId: string): Promise<SyncResult> {
    try {
      // Get user from Supabase
      const { data: supabaseUser, error } = await this.supabase.auth.admin.getUserById(supabaseUserId)
      
      if (error || !supabaseUser) {
        return {
          success: false,
          error: 'User not found in Supabase'
        }
      }

      // Check if mapping already exists
      const existingMapping = await this.getUserMappingBySupabaseId(supabaseUserId)
      
      if (existingMapping) {
        // Update existing BestAuth user
        const updatedUser = await db.users.update(existingMapping.bestauth_user_id, {
          email: supabaseUser.user.email,
          name: supabaseUser.user.user_metadata?.full_name || supabaseUser.user.user_metadata?.name,
          avatar_url: supabaseUser.user.user_metadata?.avatar_url || supabaseUser.user.user_metadata?.picture,
          email_verified: !!supabaseUser.user.email_confirmed_at
        })

        await this.updateSyncTimestamp(existingMapping.id)
        
        await this.logSyncOperation(
          'user_update',
          'supabase',
          'bestauth',
          existingMapping.bestauth_user_id,
          'success'
        )

        return {
          success: true,
          userId: existingMapping.bestauth_user_id
        }
      } else {
        // Create new BestAuth user
        const newUser = await db.users.create({
          email: supabaseUser.user.email!,
          name: supabaseUser.user.user_metadata?.full_name || supabaseUser.user.user_metadata?.name,
          avatar_url: supabaseUser.user.user_metadata?.avatar_url || supabaseUser.user.user_metadata?.picture,
          email_verified: !!supabaseUser.user.email_confirmed_at
        })

        // Create user mapping
        await this.createUserMapping(supabaseUserId, newUser.id)

        // If user has OAuth provider, sync that too
        if (supabaseUser.user.app_metadata?.provider) {
          await this.syncOAuthAccount(
            supabaseUser.user,
            newUser.id,
            supabaseUser.user.app_metadata.provider
          )
        }

        await this.logSyncOperation(
          'user_create',
          'supabase',
          'bestauth',
          newUser.id,
          'success'
        )

        return {
          success: true,
          userId: newUser.id
        }
      }
    } catch (error) {
      console.error('syncUser error:', error)
      
      await this.logSyncOperation(
        'user_sync',
        'supabase',
        'bestauth',
        supabaseUserId,
        'failed',
        error instanceof Error ? error.message : 'Unknown error'
      )

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed'
      }
    }
  }

  /**
   * Sync all users from Supabase to BestAuth
   */
  async syncAllUsers(): Promise<BatchSyncResult> {
    const result: BatchSyncResult = {
      total: 0,
      successful: 0,
      failed: 0,
      errors: []
    }

    try {
      // Get all users from Supabase
      const { data: users, error } = await this.supabase.auth.admin.listUsers()
      
      if (error || !users) {
        throw new Error('Failed to list Supabase users')
      }

      result.total = users.users.length

      // Create migration batch record
      const batchId = await this.createMigrationBatch(result.total)

      // Process users in batches to avoid overwhelming the system
      const batchSize = 10
      for (let i = 0; i < users.users.length; i += batchSize) {
        const batch = users.users.slice(i, i + batchSize)
        
        await Promise.all(
          batch.map(async (user) => {
            const syncResult = await this.syncUser(user.id)
            
            if (syncResult.success) {
              result.successful++
            } else {
              result.failed++
              result.errors.push({
                userId: user.id,
                error: syncResult.error || 'Unknown error'
              })
            }
          })
        )

        // Update migration progress
        await this.updateMigrationProgress(batchId, result.successful, result.failed)
      }

      // Complete migration batch
      await this.completeMigrationBatch(batchId, result.successful, result.failed)

    } catch (error) {
      console.error('syncAllUsers error:', error)
      result.errors.push({
        userId: 'batch',
        error: error instanceof Error ? error.message : 'Batch sync failed'
      })
    }

    return result
  }

  /**
   * Sync new users created after a specific date
   */
  async syncNewUsers(since: Date): Promise<BatchSyncResult> {
    const result: BatchSyncResult = {
      total: 0,
      successful: 0,
      failed: 0,
      errors: []
    }

    try {
      // Get users created after the specified date
      const { data: users, error } = await this.supabase.auth.admin.listUsers()
      
      if (error || !users) {
        throw new Error('Failed to list Supabase users')
      }

      // Filter users created after the specified date
      const newUsers = users.users.filter(user => 
        new Date(user.created_at) > since
      )

      result.total = newUsers.length

      for (const user of newUsers) {
        const syncResult = await this.syncUser(user.id)
        
        if (syncResult.success) {
          result.successful++
        } else {
          result.failed++
          result.errors.push({
            userId: user.id,
            error: syncResult.error || 'Unknown error'
          })
        }
      }
    } catch (error) {
      console.error('syncNewUsers error:', error)
      result.errors.push({
        userId: 'batch',
        error: error instanceof Error ? error.message : 'Batch sync failed'
      })
    }

    return result
  }

  /**
   * Sync a session from Supabase to BestAuth
   */
  async syncSession(supabaseSessionId: string, bestAuthUserId: string): Promise<void> {
    try {
      // Create unified session record
      await this.supabase
        .from('unified_sessions')
        .insert({
          supabase_session_id: supabaseSessionId,
          user_id: bestAuthUserId,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
    } catch (error) {
      console.error('syncSession error:', error)
    }
  }

  /**
   * Handle Supabase auth events in real-time
   */
  async handleSupabaseAuthEvent(event: AuthChangeEvent): Promise<void> {
    try {
      switch (event.event) {
        case 'SIGNED_IN':
          if (event.user) {
            await this.syncUser(event.user.id)
            if (event.session) {
              const mapping = await this.getUserMappingBySupabaseId(event.user.id)
              if (mapping) {
                await this.syncSession(event.session.access_token, mapping.bestauth_user_id)
              }
            }
          }
          break

        case 'USER_UPDATED':
          if (event.user) {
            await this.syncUser(event.user.id)
          }
          break

        case 'USER_DELETED':
          if (event.user) {
            const mapping = await this.getUserMappingBySupabaseId(event.user.id)
            if (mapping) {
              await db.users.delete(mapping.bestauth_user_id)
              await this.deleteUserMapping(mapping.id)
            }
          }
          break
      }
    } catch (error) {
      console.error('handleSupabaseAuthEvent error:', error)
    }
  }

  /**
   * Get user mapping by Supabase user ID
   */
  async getUserMapping(supabaseUserId: string): Promise<string | null> {
    const mapping = await this.getUserMappingBySupabaseId(supabaseUserId)
    return mapping?.bestauth_user_id || null
  }

  /**
   * Create user ID mapping
   */
  async createUserMapping(supabaseUserId: string, bestAuthUserId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_id_mapping')
      .insert({
        supabase_user_id: supabaseUserId,
        bestauth_user_id: bestAuthUserId,
        sync_status: 'active',
        last_synced_at: new Date().toISOString()
      })

    if (error) throw error
  }

  /**
   * Sync BestAuth user to Supabase (reverse sync)
   */
  async syncBestAuthUserToSupabase(bestAuthUserId: string): Promise<SyncResult> {
    try {
      // Get BestAuth user
      const bestAuthUser = await db.users.findById(bestAuthUserId)
      if (!bestAuthUser) {
        return {
          success: false,
          error: 'BestAuth user not found'
        }
      }

      // Check if mapping exists
      const mapping = await this.getUserMappingByBestAuthId(bestAuthUserId)

      if (mapping) {
        // Update existing Supabase user
        const { error } = await this.supabase.auth.admin.updateUserById(
          mapping.supabase_user_id,
          {
            email: bestAuthUser.email,
            user_metadata: {
              name: bestAuthUser.name,
              avatar_url: bestAuthUser.avatarUrl
            }
          }
        )

        if (error) throw error

        await this.updateSyncTimestamp(mapping.id)
      } else {
        // Create new Supabase user
        const { data, error } = await this.supabase.auth.admin.createUser({
          email: bestAuthUser.email,
          email_confirm: bestAuthUser.emailVerified,
          user_metadata: {
            name: bestAuthUser.name,
            avatar_url: bestAuthUser.avatarUrl
          }
        })

        if (error || !data.user) throw error || new Error('Failed to create Supabase user')

        // Create mapping
        await this.createUserMapping(data.user.id, bestAuthUserId)
      }

      return { success: true, userId: bestAuthUserId }
    } catch (error) {
      console.error('syncBestAuthUserToSupabase error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed'
      }
    }
  }

  // Private helper methods

  private async getUserMappingBySupabaseId(supabaseUserId: string): Promise<any> {
    const { data } = await this.supabase
      .from('user_id_mapping')
      .select('*')
      .eq('supabase_user_id', supabaseUserId)
      .single()

    return data
  }

  private async getUserMappingByBestAuthId(bestAuthUserId: string): Promise<any> {
    const { data } = await this.supabase
      .from('user_id_mapping')
      .select('*')
      .eq('bestauth_user_id', bestAuthUserId)
      .single()

    return data
  }

  private async updateSyncTimestamp(mappingId: string): Promise<void> {
    await this.supabase
      .from('user_id_mapping')
      .update({
        last_synced_at: new Date().toISOString()
      })
      .eq('id', mappingId)
  }

  private async deleteUserMapping(mappingId: string): Promise<void> {
    await this.supabase
      .from('user_id_mapping')
      .delete()
      .eq('id', mappingId)
  }

  private async syncOAuthAccount(
    supabaseUser: any,
    bestAuthUserId: string,
    provider: string
  ): Promise<void> {
    try {
      // Get provider data from Supabase identities
      const identities = supabaseUser.identities || []
      const providerData = identities.find((i: any) => i.provider === provider)

      if (providerData) {
        await db.oauth.createOrUpdate({
          userId: bestAuthUserId,
          provider,
          providerAccountId: providerData.id,
          accessToken: null, // Not available from Supabase
          refreshToken: null,
          expiresAt: null
        })
      }
    } catch (error) {
      console.error('syncOAuthAccount error:', error)
    }
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
        error_message: errorMessage,
        created_at: new Date().toISOString()
      })
  }

  private async createMigrationBatch(totalUsers: number): Promise<string> {
    const batchId = `migration_${Date.now()}`
    
    await this.supabase
      .from('migration_status')
      .insert({
        batch_id: batchId,
        migration_type: 'full',
        total_users: totalUsers,
        status: 'running'
      })

    return batchId
  }

  private async updateMigrationProgress(
    batchId: string,
    migratedUsers: number,
    failedUsers: number
  ): Promise<void> {
    await this.supabase
      .from('migration_status')
      .update({
        migrated_users: migratedUsers,
        failed_users: failedUsers
      })
      .eq('batch_id', batchId)
  }

  private async completeMigrationBatch(
    batchId: string,
    successfulCount: number,
    failedCount: number
  ): Promise<void> {
    await this.supabase
      .from('migration_status')
      .update({
        status: failedCount === 0 ? 'completed' : 'completed_with_errors',
        completed_at: new Date().toISOString(),
        migrated_users: successfulCount,
        failed_users: failedCount
      })
      .eq('batch_id', batchId)
  }
}

// Export singleton instance
export const userSyncService = new UserSyncService()