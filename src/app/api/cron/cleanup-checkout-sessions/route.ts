import { NextRequest, NextResponse } from 'next/server'
import { runCheckoutSessionCleanup } from '@/services/payment/checkout-session-manager'

// This endpoint should be called periodically (e.g., every hour) by a cron job
// It expires old checkout sessions and cleans up rate limit records

export async function GET(req: NextRequest) {
  try {
    // Verify the request is authorized (e.g., from your cron service)
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[Cron] Starting checkout session cleanup...')
    
    const result = await runCheckoutSessionCleanup()
    
    console.log('[Cron] Cleanup completed:', result)
    
    return NextResponse.json({
      success: result.success,
      message: 'Cleanup completed',
      expiredSessions: result.expiredSessions,
      cleanedRateLimits: result.cleanedRateLimits,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('[Cron] Error during cleanup:', error)
    return NextResponse.json(
      { 
        error: 'Cleanup failed',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

// Also support POST for compatibility with some cron services
export async function POST(req: NextRequest) {
  return GET(req)
}