import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateSessionId } from '@/lib/session-utils'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'
import { authConfig } from '@/config/auth.config'

export async function GET(request: NextRequest) {
  try {
    // Get or create session
    const sessionInfo = await getOrCreateSessionId()
    console.log('[Test Session] Session info:', sessionInfo)
    
    // Get current usage
    const usage = await bestAuthSubscriptionService.getSessionUsageToday(sessionInfo.sessionId)
    console.log('[Test Session] Current usage:', usage)
    
    // Check if can generate
    const canGenerate = await bestAuthSubscriptionService.canSessionGenerate(sessionInfo.sessionId)
    console.log('[Test Session] Can generate:', canGenerate)
    
    const response = NextResponse.json({
      sessionId: sessionInfo.sessionId,
      isNewSession: sessionInfo.isNew,
      currentUsage: usage,
      canGenerate: canGenerate,
      usesBestAuth: authConfig.USE_BESTAUTH
    })
    
    // If new session, ensure cookie is set
    if (sessionInfo.isNew) {
      const { getSessionCookieOptions } = await import('@/lib/session-utils')
      const cookieOptions = getSessionCookieOptions()
      response.cookies.set(cookieOptions.name, sessionInfo.sessionId, cookieOptions)
    }
    
    return response
  } catch (error) {
    console.error('[Test Session] Error:', error)
    return NextResponse.json({ error: 'Failed to test session' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get session
    const sessionInfo = await getOrCreateSessionId()
    console.log('[Test Session] POST - Session info:', sessionInfo)
    
    // Increment usage
    const result = await bestAuthSubscriptionService.incrementSessionUsage(sessionInfo.sessionId, 1)
    console.log('[Test Session] Increment result:', result)
    
    // Get new usage
    const newUsage = await bestAuthSubscriptionService.getSessionUsageToday(sessionInfo.sessionId)
    console.log('[Test Session] New usage:', newUsage)
    
    const response = NextResponse.json({
      sessionId: sessionInfo.sessionId,
      incrementResult: result,
      newUsage: newUsage
    })
    
    // If new session, ensure cookie is set
    if (sessionInfo.isNew) {
      const { getSessionCookieOptions } = await import('@/lib/session-utils')
      const cookieOptions = getSessionCookieOptions()
      response.cookies.set(cookieOptions.name, sessionInfo.sessionId, cookieOptions)
    }
    
    return response
  } catch (error) {
    console.error('[Test Session] POST Error:', error)
    return NextResponse.json({ error: 'Failed to increment usage' }, { status: 500 })
  }
}