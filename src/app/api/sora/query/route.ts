import { NextRequest, NextResponse } from 'next/server'
import { querySoraTask, SoraApiError } from '@/lib/sora-api'
import { authConfig } from '@/config/auth.config'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'
import { getUserFromRequest } from '@/lib/bestauth/middleware'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

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
