import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/middleware/withAuth'
import { createPointsService } from '@/lib/services/points-service'
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client'
import { userSyncService } from '@/services/sync/UserSyncService'

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function extractSupabaseIdFromMetadata(metadata: any): string | null {
  if (!metadata || typeof metadata !== 'object') {
    return null
  }

  const candidates = [
    metadata.resolved_supabase_user_id,
    metadata.supabase_user_id,
    metadata.original_payload_user_id,
    metadata.original_userId
  ]

  return candidates.find(isUuid) ?? null
}

async function handler(request: AuthenticatedRequest) {
  try {
    const user = request.user

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getBestAuthSupabaseClient()
    if (!supabase) {
      console.error('[Points Balance API] Service role Supabase client unavailable')
      return NextResponse.json(
        { error: 'Unable to fetch points balance' },
        { status: 500 }
      )
    }
    const pointsService = createPointsService(supabase)

    // Resolve the Supabase user id for this BestAuth user
    let supabaseUserId = user.id

    try {
      const { data: mapping, error: mappingError } = await supabase
        .from('user_id_mapping')
        .select('supabase_user_id')
        .eq('bestauth_user_id', user.id)
        .maybeSingle()

      if (mappingError && mappingError.code !== 'PGRST116') {
        console.error('[Points Balance API] Error fetching user mapping:', mappingError)
      }

      if (mapping?.supabase_user_id && isUuid(mapping.supabase_user_id)) {
        supabaseUserId = mapping.supabase_user_id
      } else {
        const { data: subscription } = await supabase
          .from('bestauth_subscriptions')
          .select('metadata')
          .eq('user_id', user.id)
          .maybeSingle()

        const metadataSupabaseId = extractSupabaseIdFromMetadata(subscription?.metadata)

        if (metadataSupabaseId) {
          supabaseUserId = metadataSupabaseId

          try {
            await userSyncService.createUserMapping(metadataSupabaseId, user.id)
            console.log('[Points Balance API] Created user mapping while resolving Supabase id')
          } catch (createMappingError: any) {
            if (createMappingError?.code === '23505') {
              console.warn('[Points Balance API] Mapping already existed when creating during balance fetch')
            } else {
              console.error('[Points Balance API] Failed to create mapping during balance fetch:', createMappingError)
            }
          }
        } else {
          console.warn('[Points Balance API] Unable to resolve Supabase user id for BestAuth user', { bestauthUserId: user.id })
        }
      }
    } catch (resolveError) {
      console.error('[Points Balance API] Unexpected error resolving Supabase user id:', resolveError)
    }
    
    // Gracefully handle points table not existing yet
    try {
      const balance = await pointsService.getBalance(supabaseUserId)

      if (!balance) {
        return NextResponse.json({
          balance: 0,
          lifetime_earned: 0,
          lifetime_spent: 0,
          tier: 'free',
        })
      }

      return NextResponse.json(balance)
    } catch (pointsError: any) {
      console.warn('[Points Balance API] Points table may not exist yet:', pointsError.message)
      // Return default balance if points system not set up
      return NextResponse.json({
        balance: 0,
        lifetime_earned: 0,
        lifetime_spent: 0,
        tier: 'free',
      })
    }
  } catch (error) {
    console.error('[Points Balance API] Error:', error)
    // Return default balance instead of error to prevent UI blocking
    return NextResponse.json({
      balance: 0,
      lifetime_earned: 0,
      lifetime_spent: 0,
      tier: 'free',
    })
  }
}

export const GET = withAuth(handler)
