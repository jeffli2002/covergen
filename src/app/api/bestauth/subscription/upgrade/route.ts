// BestAuth Subscription Upgrade API
import { NextRequest, NextResponse } from 'next/server'
import { validateSessionFromRequest } from '@/lib/bestauth'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'
import { creemService, SUBSCRIPTION_PLANS } from '@/services/payment/creem'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Force Node.js runtime for Creem SDK compatibility
export const runtime = 'nodejs'

// POST /api/bestauth/subscription/upgrade - Upgrade a subscription tier (including trial upgrades)
export async function POST(request: NextRequest) {
  console.log('='.repeat(80))
  console.log('[Upgrade API] Starting upgrade request')
  console.log('='.repeat(80))
  
  try {
    console.log('[Upgrade API] Step 1: Validating session...')
    
    // Try BestAuth first
    let userId: string | undefined
    let userEmail: string | undefined
    
    const bestAuthSession = await validateSessionFromRequest(request)
    console.log('[Upgrade API] BestAuth validation result:', { success: bestAuthSession.success, hasData: !!bestAuthSession.data })
    
    if (bestAuthSession.success && bestAuthSession.data) {
      userId = bestAuthSession.data.user.id
      userEmail = bestAuthSession.data.user.email
      console.log('[Upgrade API] ✅ Authenticated via BestAuth')
    } else {
      // Fallback to Supabase auth
      console.log('[Upgrade API] BestAuth failed, trying Supabase...')
      
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set() {},
            remove() {}
          }
        }
      )
      
      const { data: { user }, error } = await supabase.auth.getUser()
      console.log('[Upgrade API] Supabase auth result:', { hasUser: !!user, error: error?.message })
      
      if (user) {
        userId = user.id
        userEmail = user.email
        console.log('[Upgrade API] ✅ Authenticated via Supabase')
      }
    }
    
    if (!userId || !userEmail) {
      console.log('[Upgrade API] ❌ No valid session from either BestAuth or Supabase')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('[Upgrade API] Step 2: Parsing request body...')
    const body = await request.json()
    console.log('[Upgrade API] Request body received:', body)
    
    const { targetTier } = body
    
    console.log('[Upgrade API] Request details:', {
      userId,
      userEmail,
      targetTier,
      timestamp: new Date().toISOString()
    })
    
    // Validate target tier
    console.log('[Upgrade API] Step 3: Validating target tier...')
    if (!targetTier || !['pro', 'pro_plus'].includes(targetTier)) {
      console.error('[Upgrade API] Invalid target tier:', targetTier)
      return NextResponse.json(
        { error: 'Invalid target tier' },
        { status: 400 }
      )
    }
    console.log('[Upgrade API] Target tier validated:', targetTier)
    
    // Get current subscription
    console.log('[Upgrade API] Step 4: Fetching current subscription...')
    const currentSubscription = await bestAuthSubscriptionService.getUserSubscription(userId)
    console.log('[Upgrade API] Current subscription:', currentSubscription ? {
      tier: currentSubscription.tier,
      status: currentSubscription.status,
      hasStripeId: !!currentSubscription.stripe_subscription_id
    } : 'null')
    
    if (!currentSubscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }
    
    console.log('[Upgrade] Current subscription:', {
      tier: currentSubscription.tier,
      status: currentSubscription.status,
      isTrialing: currentSubscription.is_trialing,
      hasPaymentMethod: currentSubscription.has_payment_method
    })
    
    // Validate upgrade path
    if (currentSubscription.tier === targetTier) {
      return NextResponse.json(
        { error: 'Already on the selected plan' },
        { status: 400 }
      )
    }
    
    if (currentSubscription.tier === 'pro_plus' && targetTier === 'pro') {
      return NextResponse.json(
        { error: 'Downgrading is not supported yet' },
        { status: 400 }
      )
    }
    
    // Handle trial users with payment method - instant upgrade
    if (currentSubscription.is_trialing && currentSubscription.has_payment_method) {
      console.log('[Upgrade] Trial user with payment method, attempting instant upgrade')
      
      // Since Creem SDK doesn't support direct subscription updates,
      // we need to handle this through database updates and wait for
      // the next billing cycle for Creem to update
      
      // For now, we'll update the database tier and notify the user
      // that the upgrade will take effect immediately but billing
      // will be adjusted on the next cycle
      
      const billingCycle = currentSubscription.billing_cycle || 'monthly'
      const previousTier = currentSubscription.tier
      
      // Build upgrade history entry
      const upgradeHistoryEntry = {
        from_tier: previousTier,
        to_tier: targetTier,
        upgraded_at: new Date().toISOString(),
        upgrade_type: 'trial_upgrade',
        billing_cycle: billingCycle
      }
      
      // Get existing upgrade history and append new entry
      const existingHistory = currentSubscription.metadata?.upgrade_history || []
      const upgradeHistory = [...existingHistory, upgradeHistoryEntry]
      
      const updated = await bestAuthSubscriptionService.createOrUpdateSubscription({
        userId,
        tier: targetTier,
        previousTier: previousTier,
        billingCycle: billingCycle,
        // Keep trial status but with new tier
        status: 'trialing',
        upgradeHistory: upgradeHistory,
        metadata: {
          ...currentSubscription.metadata,
          upgraded_at: new Date().toISOString(),
          upgraded_from: previousTier,
          upgraded_during_trial: true,
          previous_billing_cycle: currentSubscription.billing_cycle
        }
      })
      
      // TODO: When Creem SDK supports subscription updates, call:
      // await creemService.upgradeSubscription(currentSubscription.stripe_subscription_id, targetTier)
      
      const planName = targetTier === 'pro_plus' ? 'Pro+' : 'Pro'
      return NextResponse.json({
        success: true,
        upgraded: true,
        message: `Upgraded to ${planName}! Your new plan is active immediately.`,
        subscription: updated,
        note: 'Billing will be adjusted at the end of your trial period.'
      })
    }
    
    // Handle trial users without payment method - need checkout
    if (currentSubscription.is_trialing && !currentSubscription.has_payment_method) {
      console.log('[Upgrade] Trial user without payment method, creating checkout session')
      
      // Create checkout session for the new plan
      const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || ''
      const locale = request.headers.get('x-locale') || 'en'
      
      const result = await creemService.createCheckoutSession({
        userId,
        userEmail,
        planId: targetTier as 'pro' | 'pro_plus',
        successUrl: `${origin}/${locale}/payment/success?session_id={CHECKOUT_SESSION_ID}&upgrade=true`,
        cancelUrl: `${origin}/${locale}/payment/cancel`,
        currentPlan: currentSubscription.tier || 'free'
      })
      
      if (!result.success || !result.url) {
        throw new Error(result.error || 'Failed to create checkout session')
      }
      
      return NextResponse.json({
        success: true,
        upgraded: false,
        checkoutUrl: result.url,
        message: 'Please complete checkout to upgrade your plan'
      })
    }
    
    // Handle paid users upgrading - immediate with proration
    if (currentSubscription.status === 'active' && currentSubscription.tier !== 'free') {
      console.log('[Upgrade] Paid user upgrading with immediate proration')
      
      // Comprehensive validation before attempting upgrade
      if (!currentSubscription.stripe_subscription_id) {
        console.error('[Upgrade] No Creem subscription ID found in database')
        return NextResponse.json(
          { 
            error: 'No Creem subscription ID found',
            details: 'Your subscription is not linked to a payment provider. Please contact support.',
            subscriptionInfo: {
              tier: currentSubscription.tier,
              status: currentSubscription.status,
              hasStripeId: false
            }
          },
          { status: 400 }
        )
      }
      
      // Validate subscription ID format
      if (!currentSubscription.stripe_subscription_id.startsWith('sub_')) {
        console.error('[Upgrade] Invalid Creem subscription ID format:', currentSubscription.stripe_subscription_id)
        return NextResponse.json(
          { 
            error: 'Invalid subscription ID format',
            details: 'Subscription ID should start with "sub_"',
            subscriptionId: currentSubscription.stripe_subscription_id.substring(0, 10) + '...'
          },
          { status: 400 }
        )
      }
      
      // Get billing cycle from subscription or default to monthly
      const billingCycle = currentSubscription.billing_cycle || 'monthly'
      const previousTier = currentSubscription.tier
      
      console.log('[Upgrade] Calling Creem to upgrade subscription:', {
        subscriptionId: currentSubscription.stripe_subscription_id,
        targetTier,
        billingCycle
      })
      
      // Call Creem to upgrade with immediate proration
      let upgradeResult
      try {
        console.log('[Upgrade] About to call Creem upgradeSubscription')
        console.log('[Upgrade] Parameters:', {
          subscriptionId: currentSubscription.stripe_subscription_id,
          targetTier,
          billingCycle,
          subscriptionIdType: typeof currentSubscription.stripe_subscription_id,
          subscriptionIdLength: currentSubscription.stripe_subscription_id?.length
        })
        
        upgradeResult = await creemService.upgradeSubscription(
          currentSubscription.stripe_subscription_id,
          targetTier as 'pro' | 'pro_plus',
          billingCycle as 'monthly' | 'yearly'
        )
        
        console.log('[Upgrade] Creem call completed successfully')
      } catch (creemError: any) {
        console.error('[Upgrade] Creem upgrade call threw exception:', {
          error: creemError,
          errorType: typeof creemError,
          errorConstructor: creemError?.constructor?.name,
          message: creemError?.message,
          stack: creemError?.stack,
          code: creemError?.code,
          statusCode: creemError?.statusCode,
          response: creemError?.response,
          data: creemError?.data
        })
        throw new Error(`Creem API error: ${creemError?.message || 'Unknown error'}`)
      }
      
      console.log('[Upgrade] Creem upgrade result received:', {
        success: upgradeResult.success,
        hasSubscription: !!upgradeResult.subscription,
        error: upgradeResult.error
      })
      
      if (!upgradeResult.success) {
        console.error('[Upgrade] Creem upgrade failed:', upgradeResult.error)
        throw new Error(upgradeResult.error || 'Failed to upgrade subscription with Creem')
      }
      
      console.log('[Upgrade] Creem upgrade result:', {
        success: upgradeResult.success,
        hasSubscription: !!upgradeResult.subscription,
        prorationAmount: upgradeResult.prorationAmount
      })
      
      // Extract proration details from Creem response
      const prorationAmount = upgradeResult.prorationAmount || null
      const prorationDate = prorationAmount ? new Date() : null
      
      // Build upgrade history entry
      const upgradeHistoryEntry = {
        from_tier: previousTier,
        to_tier: targetTier,
        upgraded_at: new Date().toISOString(),
        upgrade_type: 'immediate_proration',
        billing_cycle: billingCycle,
        proration_amount: prorationAmount
      }
      
      // Get existing upgrade history and append new entry
      const existingHistory = currentSubscription.metadata?.upgrade_history || []
      const upgradeHistory = [...existingHistory, upgradeHistoryEntry]
      
      // Update local database with new tier and complete tracking
      console.log('[Upgrade] Updating database with:', {
        userId,
        tier: targetTier,
        previousTier: previousTier,
        billingCycle: billingCycle,
        status: 'active',
        prorationAmount: prorationAmount
      })
      
      let updateResult
      try {
        updateResult = await bestAuthSubscriptionService.createOrUpdateSubscription({
          userId,
          tier: targetTier,
          previousTier: previousTier,
          billingCycle: billingCycle,
          status: 'active',
          prorationAmount: prorationAmount,
          lastProrationDate: prorationDate,
          upgradeHistory: upgradeHistory,
          metadata: {
            ...currentSubscription.metadata,
            upgraded_at: new Date().toISOString(),
            upgraded_from: previousTier,
            upgrade_type: 'immediate_proration',
            previous_billing_cycle: currentSubscription.billing_cycle,
            proration_charged: prorationAmount
          }
        })
      } catch (dbError: any) {
        console.error('[Upgrade] Database update failed:', {
          error: dbError,
          message: dbError?.message,
          stack: dbError?.stack
        })
        throw new Error(`Database update failed: ${dbError?.message || 'Unknown error'}`)
      }
      
      console.log('[Upgrade] Database update result:', {
        success: !!updateResult,
        tier: updateResult?.tier,
        status: updateResult?.status
      })
      
      if (!updateResult) {
        console.error('[Upgrade] Database update returned null/undefined')
        throw new Error('Database update failed - no result returned')
      }
      
      const planName = targetTier === 'pro_plus' ? 'Pro+' : 'Pro'
      const currentPlanName = currentSubscription.tier === 'pro' ? 'Pro' : 'Pro+'
      
      console.log('='.repeat(80))
      console.log('[Upgrade API] SUCCESS - Returning response')
      console.log('[Upgrade API] User should now be on tier:', targetTier)
      console.log('[Upgrade API] Database update confirmed tier:', updateResult?.tier)
      console.log('='.repeat(80))
      
      // Get locale from headers for redirect
      const locale = request.headers.get('x-locale') || 'en'
      const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || ''
      
      return NextResponse.json({
        success: true,
        upgraded: true,
        immediate: true,
        currentTier: targetTier,
        previousTier: previousTier,
        prorationAmount: prorationAmount,
        redirectUrl: `${origin}/${locale}/account?upgraded=true`,
        message: `Successfully upgraded from ${currentPlanName} to ${planName}!`,
        note: `You now have immediate access to ${planName} features. Prorated charges have been applied to your account.`
      })
    }
    
    // Default case - create checkout
    return NextResponse.json({
      success: false,
      error: 'Upgrade not available for your current subscription',
      message: 'Please contact support for assistance'
    })
    
  } catch (error) {
    console.error('='.repeat(80))
    console.error('[Upgrade API] FATAL ERROR')
    console.error('='.repeat(80))
    console.error('[Upgrade API] Error object:', error)
    console.error('[Upgrade API] Error type:', typeof error)
    console.error('[Upgrade API] Error constructor:', error?.constructor?.name)
    console.error('[Upgrade API] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('[Upgrade API] Error message:', error instanceof Error ? error.message : String(error))
    
    // Extract detailed error information
    let errorDetails: any = {
      message: error instanceof Error ? error.message : String(error),
      type: error?.constructor?.name || typeof error,
      stack: error instanceof Error ? error.stack : undefined
    }
    
    // Check for common error types
    if (error && typeof error === 'object') {
      const err = error as any
      if (err.code) errorDetails.code = err.code
      if (err.statusCode) errorDetails.statusCode = err.statusCode
      if (err.response) errorDetails.response = err.response
      if (err.data) errorDetails.data = err.data
      if (err.cause) errorDetails.cause = err.cause
    }
    
    console.error('[Upgrade API] Full error details:', JSON.stringify(errorDetails, null, 2))
    console.error('='.repeat(80))
    
    return NextResponse.json(
      { 
        error: 'Failed to process upgrade',
        details: error instanceof Error ? error.message : String(error),
        debugInfo: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}