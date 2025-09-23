// BestAuth Subscription Status API
import { NextRequest, NextResponse } from 'next/server'
import { validateSessionFromRequest } from '@/lib/bestauth'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'

export async function GET(request: NextRequest) {
  try {
    // Check if this is a debug request
    const url = new URL(request.url)
    const debug = url.searchParams.get('debug')
    
    if (debug === 'usage') {
      // Debug usage tracking table access
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
      
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      })
      
      const { data, error, count } = await supabase
        .from('bestauth_usage_tracking')
        .select('*', { count: 'exact' })
        .limit(3)
      
      return NextResponse.json({
        debug: 'usage_table_test',
        success: !error,
        data,
        count,
        error: error ? {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        } : null
      })
    }
    
    if (debug === 'auth') {
      // Debug session validation
      const { extractBearerToken } = await import('@/lib/bestauth/request-utils')
      const token = extractBearerToken(request)
      
      return NextResponse.json({
        debug: 'auth_test',
        hasAuthHeader: !!request.headers.get('authorization'),
        authHeader: request.headers.get('authorization')?.substring(0, 20) + '...',
        hasToken: !!token,
        tokenLength: token?.length || 0,
        cookies: request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value }))
      })
    }
    
    // Validate session
    const session = await validateSessionFromRequest(request)
    
    if (!session.success || !session.data) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = session.data.user.id
    
    // Get subscription status
    const subscription = await bestAuthSubscriptionService.getUserSubscription(userId)
    
    if (!subscription) {
      // Create default free subscription if none exists
      await bestAuthSubscriptionService.createOrUpdateSubscription({
        userId,
        tier: 'free',
        status: 'active'
      })
      
      // Try again
      const newSubscription = await bestAuthSubscriptionService.getUserSubscription(userId)
      return NextResponse.json(newSubscription)
    }
    
    console.log('[subscription/status] Subscription data:', {
      userId,
      tier: subscription.tier,
      status: subscription.status,
      stripe_subscription_id: subscription.stripe_subscription_id
    })
    
    // Add additional computed fields for compatibility with existing code
    const response = {
      ...subscription,
      // Compatibility fields
      plan: subscription.tier,
      isTrialing: subscription.is_trialing,
      trialDaysRemaining: subscription.trial_days_remaining,
      hasPaymentMethod: subscription.has_payment_method,
      requiresPaymentSetup: subscription.requires_payment_setup,
      canGenerate: subscription.can_generate,
      usageToday: subscription.usage_today,
      usageLimit: {
        daily: subscription.daily_limit,
        monthly: subscription.monthly_limit
      }
    }
    
    console.log('[subscription/status] Returning response:', {
      tier: response.tier,
      plan: response.plan,
      status: response.status
    })
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Subscription status error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    )
  }
}