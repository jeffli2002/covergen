// Debug endpoint to test upgrade functionality
import { NextRequest, NextResponse } from 'next/server'
import { validateSessionFromRequest } from '@/lib/bestauth'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'
import { creemService, CREEM_PRODUCTS } from '@/services/payment/creem'

// Force Node.js runtime
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    console.log('[Debug Upgrade Test] Starting diagnostic...')
    
    // Check session
    const session = await validateSessionFromRequest(request)
    
    if (!session.success || !session.data) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        step: 'session_validation'
      }, { status: 401 })
    }
    
    const userId = session.data.user.id
    const userEmail = session.data.user.email
    
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      userId,
      userEmail,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        runtime: 'nodejs'
      },
      creem: {
        testMode: process.env.NEXT_PUBLIC_CREEM_TEST_MODE,
        hasApiKey: !!process.env.CREEM_API_KEY,
        apiKeyPrefix: process.env.CREEM_API_KEY?.substring(0, 10) + '...',
        isTestKey: process.env.CREEM_API_KEY?.startsWith('creem_test_'),
        products: {
          pro_monthly: CREEM_PRODUCTS.pro_monthly || 'NOT SET',
          pro_yearly: CREEM_PRODUCTS.pro_yearly || 'NOT SET',
          pro_plus_monthly: CREEM_PRODUCTS.pro_plus_monthly || 'NOT SET',
          pro_plus_yearly: CREEM_PRODUCTS.pro_plus_yearly || 'NOT SET'
        },
        envVars: {
          NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY: process.env.NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY || 'NOT SET',
          NEXT_PUBLIC_PRICE_ID_PRO_YEARLY: process.env.NEXT_PUBLIC_PRICE_ID_PRO_YEARLY || 'NOT SET',
          NEXT_PUBLIC_PRICE_ID_PROPLUS_MONTHLY: process.env.NEXT_PUBLIC_PRICE_ID_PROPLUS_MONTHLY || 'NOT SET',
          NEXT_PUBLIC_PRICE_ID_PROPLUS_YEARLY: process.env.NEXT_PUBLIC_PRICE_ID_PROPLUS_YEARLY || 'NOT SET'
        }
      },
      subscription: null,
      errors: []
    }
    
    // Get current subscription
    try {
      const currentSubscription = await bestAuthSubscriptionService.getUserSubscription(userId)
      
      if (!currentSubscription) {
        diagnostics.errors.push('No subscription found for user')
        diagnostics.subscription = null
      } else {
        diagnostics.subscription = {
          tier: currentSubscription.tier,
          status: currentSubscription.status,
          is_trialing: currentSubscription.is_trialing,
          has_payment_method: currentSubscription.has_payment_method,
          stripe_subscription_id: currentSubscription.stripe_subscription_id,
          billing_cycle: currentSubscription.billing_cycle,
          previous_tier: currentSubscription.previous_tier,
          upgrade_history_count: currentSubscription.upgrade_history?.length || 0
        }
        
        // Validate subscription ID
        if (!currentSubscription.stripe_subscription_id) {
          diagnostics.errors.push('Missing Creem subscription ID (stripe_subscription_id is null)')
        } else if (!currentSubscription.stripe_subscription_id.startsWith('sub_')) {
          diagnostics.errors.push(`Invalid subscription ID format: ${currentSubscription.stripe_subscription_id}`)
        }
        
        // Check if upgrade path is valid
        if (currentSubscription.tier === 'free') {
          diagnostics.errors.push('User is on free tier, cannot upgrade directly (need checkout)')
        }
        
        if (currentSubscription.tier === 'pro_plus') {
          diagnostics.errors.push('User is already on Pro+ (highest tier)')
        }
      }
    } catch (subError: any) {
      diagnostics.errors.push({
        step: 'subscription_retrieval',
        error: subError.message,
        type: subError.constructor.name,
        stack: subError.stack
      })
    }
    
    // Test Creem service initialization
    try {
      const isTestMode = creemService.isTestMode()
      diagnostics.creem.actualTestMode = isTestMode
      diagnostics.creem.serviceInitialized = true
    } catch (creemError: any) {
      diagnostics.errors.push({
        step: 'creem_service_init',
        error: creemError.message,
        type: creemError.constructor.name
      })
      diagnostics.creem.serviceInitialized = false
    }
    
    // Analyze what would happen if upgrade was attempted
    diagnostics.upgradeSimulation = {
      canProceed: diagnostics.errors.length === 0,
      blockers: diagnostics.errors,
      nextSteps: []
    }
    
    if (diagnostics.subscription) {
      const sub = diagnostics.subscription
      
      if (sub.tier === 'pro' && !sub.is_trialing && sub.stripe_subscription_id) {
        diagnostics.upgradeSimulation.nextSteps.push({
          action: 'Immediate upgrade via Creem API',
          targetTier: 'pro_plus',
          billingCycle: sub.billing_cycle || 'monthly',
          productId: CREEM_PRODUCTS[`pro_plus_${sub.billing_cycle || 'monthly'}` as keyof typeof CREEM_PRODUCTS],
          subscriptionId: sub.stripe_subscription_id,
          prorationBehavior: 'proration-charge-immediately'
        })
      } else if (sub.tier === 'pro' && sub.is_trialing && sub.has_payment_method) {
        diagnostics.upgradeSimulation.nextSteps.push({
          action: 'Database-only upgrade (trial with payment method)',
          note: 'Upgrade tier in database, wait for Creem webhook after trial ends'
        })
      } else if (sub.tier === 'pro' && sub.is_trialing && !sub.has_payment_method) {
        diagnostics.upgradeSimulation.nextSteps.push({
          action: 'Redirect to checkout',
          note: 'User needs to complete payment setup first'
        })
      }
    }
    
    return NextResponse.json(diagnostics, { status: 200 })
    
  } catch (error: any) {
    console.error('[Debug Upgrade Test] Fatal error:', error)
    
    return NextResponse.json({
      error: 'Diagnostic test failed',
      details: {
        message: error.message,
        type: error.constructor.name,
        stack: error.stack
      }
    }, { status: 500 })
  }
}
