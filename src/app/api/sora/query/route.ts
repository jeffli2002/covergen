import { NextRequest, NextResponse } from 'next/server'
import { querySoraTask, SoraApiError } from '@/lib/sora-api'
import { authConfig } from '@/config/auth.config'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'
import { getUserFromRequest } from '@/lib/bestauth/middleware'
import { deductPointsForGeneration } from '@/lib/middleware/points-check'
import { createClient } from '@/utils/supabase/server'
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client'
import type { GenerationType } from '@/config/subscription'

/**
 * Resolve BestAuth user ID to Supabase user ID for points system
 * Points are stored in Supabase with Supabase user IDs
 */
async function resolveSupabaseUserId(bestAuthUserId: string): Promise<string> {
  try {
    const supabaseAdmin = getBestAuthSupabaseClient()
    if (!supabaseAdmin) {
      console.error('[Sora Query] No Supabase admin client available')
      return bestAuthUserId // Fallback to BestAuth ID
    }

    // Try user_id_mapping table first
    const { data: mapping } = await supabaseAdmin
      .from('user_id_mapping')
      .select('supabase_user_id')
      .eq('bestauth_user_id', bestAuthUserId)
      .maybeSingle()

    if (mapping?.supabase_user_id) {
      console.log('[Sora Query] Resolved Supabase user ID from mapping:', mapping.supabase_user_id)
      return mapping.supabase_user_id
    }

    // Fallback to subscription metadata
    const { data: subscription } = await supabaseAdmin
      .from('bestauth_subscriptions')
      .select('metadata')
      .eq('user_id', bestAuthUserId)
      .maybeSingle()

    const isUuid = (val: unknown): val is string =>
      typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val)

    const candidates = [
      subscription?.metadata?.resolved_supabase_user_id,
      subscription?.metadata?.supabase_user_id,
      subscription?.metadata?.original_payload_user_id,
    ]

    const resolvedId = candidates.find(isUuid)
    if (resolvedId) {
      console.log('[Sora Query] Resolved Supabase user ID from metadata:', resolvedId)
      return resolvedId
    }

    console.error('[Sora Query] CRITICAL: Unable to resolve Supabase user ID for BestAuth user:', bestAuthUserId)
    return bestAuthUserId // Fallback to BestAuth ID
  } catch (error) {
    console.error('[Sora Query] Error resolving Supabase user ID:', error)
    return bestAuthUserId // Fallback
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    const quality = searchParams.get('quality') || 'standard'

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required' },
        { status: 400 }
      )
    }

    const taskInfo = await querySoraTask(taskId)
    
    // Track usage only when video generation succeeds (not on task creation)
    if (taskInfo.state === 'success' && authConfig.USE_BESTAUTH) {
      const user = await getUserFromRequest(request)
      if (user) {
        try {
          // Check if this task has already been counted
          const db = (await import('@/lib/bestauth/db')).db
          const existingUsage = await db.videoTasks.findByTaskId(taskId)
          
          if (!existingUsage) {
            const generationType: GenerationType = quality === 'pro' ? 'sora2ProVideo' : 'sora2Video'
            const supabase = await createClient()
            
            // CRITICAL FIX: Resolve BestAuth user ID to Supabase user ID for points system
            const supabaseUserId = await resolveSupabaseUserId(user.id)
            console.log('[Sora Query] User ID resolution:', { bestAuthId: user.id, supabaseId: supabaseUserId })
            
            const pointsDeduction = await deductPointsForGeneration(supabaseUserId, generationType, supabase, {
              taskId,
              quality,
              mode: taskInfo.model || 'text-to-video',
            })
            
            if (pointsDeduction.success && pointsDeduction.transaction) {
              console.log('[Sora Query] Deducted points for video generation:', pointsDeduction.transaction)
            } else if (!pointsDeduction.success) {
              console.error('[Sora Query] Failed to deduct points:', pointsDeduction.error)
            }

            // First time seeing this successful task - increment usage
            await bestAuthSubscriptionService.incrementUserVideoUsage(user.id)
            // Mark this task as counted to prevent double-charging
            await db.videoTasks.create({
              taskId,
              userId: user.id,
              status: 'success',
              createdAt: new Date()
            })
            console.log('[Sora Query] Usage incremented for successful video generation:', taskId)
          }
        } catch (error) {
          console.error('[Sora Query] Failed to track usage:', error)
          // Don't fail the request if usage tracking fails
        }
      }
    }

    return NextResponse.json(taskInfo)

  } catch (error) {
    console.error('Sora query task error:', error)

    if (error instanceof SoraApiError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code >= 500 ? 500 : 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
