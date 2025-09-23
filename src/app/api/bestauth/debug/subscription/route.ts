// BestAuth Debug Subscription API
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/bestauth'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'

export async function GET(request: NextRequest) {
  try {
    // Get session from cookie
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('bestauth.session')
    
    if (!sessionCookie?.value) {
      return NextResponse.json({
        error: 'Not authenticated',
        hint: 'Please login first at /en/account',
        cookies: cookieStore.getAll().map(c => ({ name: c.name, hasValue: !!c.value }))
      }, { status: 401 })
    }
    
    // Validate session
    const validation = await validateSession(sessionCookie.value)
    
    if (!validation.success || !validation.data) {
      return NextResponse.json({
        error: 'Invalid session',
        hint: 'Your session may have expired. Please login again.',
        validationError: validation.error
      }, { status: 401 })
    }
    
    const user = validation.data
    const userId = user.id
    
    // Get debug mode from query params
    const url = new URL(request.url)
    const debug = url.searchParams.get('debug')
    
    if (debug === 'raw') {
      const { db } = await import('@/lib/bestauth/db-wrapper')
      const rawSubscription = await db.subscriptions.get(userId)
      const status = await db.subscriptions.getStatus(userId)
      
      return NextResponse.json({
        debug: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        rawSubscription,
        computedStatus: status,
        analysis: {
          hasRawSubscription: !!rawSubscription,
          rawTier: rawSubscription?.tier,
          rawStatus: rawSubscription?.status,
          computedTier: status?.tier,
          computedStatus: status?.status,
          stripeSyncNeeded: rawSubscription?.stripe_subscription_id && 
                           rawSubscription?.status === 'incomplete'
        }
      })
    }
    
    if (debug === 'usage') {
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
      
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      })
      
      const { data, error } = await supabase
        .from('bestauth_usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .order('tracked_at', { ascending: false })
        .limit(10)
      
      return NextResponse.json({
        debug: 'usage',
        user: {
          id: user.id,
          email: user.email
        },
        usageRecords: {
          success: !error,
          data,
          error: error ? {
            code: error.code,
            message: error.message,
            details: error.details
          } : null
        }
      })
    }
    
    // Default: Get subscription status
    const subscription = await bestAuthSubscriptionService.getUserSubscription(userId)
    
    if (!subscription) {
      // Create default free subscription
      await bestAuthSubscriptionService.createOrUpdateSubscription({
        userId,
        tier: 'free',
        status: 'active'
      })
      
      const newSubscription = await bestAuthSubscriptionService.getUserSubscription(userId)
      
      return NextResponse.json({
        message: 'Created default free subscription',
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        subscription: newSubscription
      })
    }
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      subscription: {
        ...subscription,
        // Add computed fields for easier debugging
        summary: {
          tier: subscription.tier,
          status: subscription.status,
          canGenerate: subscription.can_generate,
          usageToday: subscription.usage_today,
          dailyLimit: subscription.daily_limit,
          hasActiveSubscription: subscription.status === 'active',
          requiresPayment: subscription.requires_payment_setup
        }
      }
    })
    
  } catch (error) {
    console.error('[BestAuth Debug] Error:', error)
    return NextResponse.json({
      error: 'Failed to debug subscription',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}