// BestAuth Subscription Upgrade API
import { NextRequest, NextResponse } from 'next/server'
import { validateSessionFromRequest } from '@/lib/bestauth'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'
import { creemService, SUBSCRIPTION_PLANS } from '@/services/payment/creem'

// POST /api/bestauth/subscription/upgrade - Upgrade a subscription tier (including trial upgrades)
export async function POST(request: NextRequest) {
  try {
    const session = await validateSessionFromRequest(request)
    
    if (!session.success || !session.data) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.data.user.id
    const userEmail = session.data.user.email
    const body = await request.json()
    const { targetTier } = body
    
    // Validate target tier
    if (!targetTier || !['pro', 'pro_plus'].includes(targetTier)) {
      return NextResponse.json(
        { error: 'Invalid target tier' },
        { status: 400 }
      )
    }
    
    // Get current subscription
    const currentSubscription = await bestAuthSubscriptionService.getUserSubscription(userId)
    
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
      
      if (!currentSubscription.stripe_subscription_id) {
        return NextResponse.json(
          { error: 'No Creem subscription ID found' },
          { status: 400 }
        )
      }
      
      // Get billing cycle from subscription or default to monthly
      const billingCycle = currentSubscription.billing_cycle || 'monthly'
      const previousTier = currentSubscription.tier
      
      // Call Creem to upgrade with immediate proration
      const upgradeResult = await creemService.upgradeSubscription(
        currentSubscription.stripe_subscription_id,
        targetTier as 'pro' | 'pro_plus',
        billingCycle as 'monthly' | 'yearly'
      )
      
      if (!upgradeResult.success) {
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
      
      const updateResult = await bestAuthSubscriptionService.createOrUpdateSubscription({
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
      
      console.log('[Upgrade] Database update result:', {
        success: !!updateResult,
        tier: updateResult?.tier,
        status: updateResult?.status
      })
      
      const planName = targetTier === 'pro_plus' ? 'Pro+' : 'Pro'
      const currentPlanName = currentSubscription.tier === 'pro' ? 'Pro' : 'Pro+'
      
      return NextResponse.json({
        success: true,
        upgraded: true,
        immediate: true,
        currentTier: targetTier,
        previousTier: previousTier,
        prorationAmount: prorationAmount,
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
    console.error('Upgrade error:', error)
    return NextResponse.json(
      { error: 'Failed to process upgrade' },
      { status: 500 }
    )
  }
}