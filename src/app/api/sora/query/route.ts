import { NextRequest, NextResponse } from 'next/server'
import { querySoraTask, SoraApiError } from '@/lib/sora-api'
import { authConfig } from '@/config/auth.config'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'
import { getUserFromRequest } from '@/lib/bestauth/middleware'
import { deductPointsForGeneration } from '@/lib/middleware/points-check'
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client'
import type { GenerationType } from '@/config/subscription'

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
            // CRITICAL FIX: Use service role client for deducting credits from bestauth_subscriptions
            // The anon key client doesn't have permission to update bestauth_subscriptions
            const supabaseAdmin = getBestAuthSupabaseClient()
            
            if (!supabaseAdmin) {
              console.error('[Sora Query] CRITICAL: Cannot deduct credits - no admin client available')
            } else {
              // For BestAuth users, use the BestAuth user ID directly (no need to resolve to Supabase ID)
              console.log('[Sora Query] Deducting credits for BestAuth user:', user.id)
              
              const pointsDeduction = await deductPointsForGeneration(user.id, generationType, supabaseAdmin, {
                taskId,
                quality,
                mode: taskInfo.model || 'text-to-video',
              })
            
              if (pointsDeduction.success && pointsDeduction.transaction) {
                console.log('[Sora Query] Deducted points for video generation:', pointsDeduction.transaction)
              } else if (!pointsDeduction.success) {
                console.error('[Sora Query] Failed to deduct points:', pointsDeduction.error)
              }
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
