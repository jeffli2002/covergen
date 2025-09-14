import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { creemService } from '@/services/payment/creem'
import { PaymentAuthWrapper } from '@/services/payment/auth-wrapper'
import { TrialUpgradeService } from '@/services/payment/trial-upgrade'
import { getSubscriptionConfig } from '@/lib/subscription-config'

export async function POST(req: NextRequest) {
  try {
    // Get auth context using PaymentAuthWrapper
    const authContext = await PaymentAuthWrapper.getAuthContext()
    
    if (!authContext.isAuthenticated || !authContext.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { userId, userEmail } = authContext
    const { targetTier } = await req.json()
    
    // Validate target tier
    if (!targetTier || !['pro', 'pro_plus'].includes(targetTier)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      )
    }
    
    // Get current subscription
    const supabase = await createClient()
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }
    
    // Check if user is on trial
    const isTrialing = subscription.status === 'trialing'
    const currentTier = subscription.tier
    
    // Use TrialUpgradeService to check if upgrade is allowed
    const upgradeCheck = await TrialUpgradeService.canUpgradeDuringTrial({
      userId,
      fromTier: currentTier as 'free' | 'pro' | 'pro_plus',
      toTier: targetTier as 'pro' | 'pro_plus',
      isTrialActive: isTrialing,
      trialEndsAt: subscription?.trial_end ? new Date(subscription.trial_end) : null
    })
    
    if (!upgradeCheck.success) {
      return NextResponse.json(
        { error: upgradeCheck.message },
        { status: 400 }
      )
    }
    
    // Check if user has payment method on file
    const hasPaymentMethod = !!subscription.stripe_subscription_id
    
    // If user is on a trial with payment method, we can upgrade instantly
    if (isTrialing && hasPaymentMethod) {
      console.log('[Upgrade] Trial user has payment method, upgrading instantly from', currentTier, 'to', targetTier)
      
      // Use the upgrade API to change the subscription plan
      const upgradeResult = await creemService.upgradeSubscription(
        subscription.stripe_subscription_id,
        targetTier as 'pro' | 'pro_plus'
      )
      
      if (!upgradeResult.success) {
        return NextResponse.json(
          { error: upgradeResult.error || 'Failed to upgrade subscription' },
          { status: 500 }
        )
      }
      
      // Update local subscription record
      const config = getSubscriptionConfig()
      const newLimit = targetTier === 'pro_plus' 
        ? config.limits.pro_plus.monthly 
        : config.limits.pro.monthly
      
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          tier: targetTier,
          status: 'active', // Convert from trial to active
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
      
      if (updateError) {
        console.error('[Upgrade] Error updating subscription:', updateError)
      }
      
      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_tier: targetTier,
          quota_limit: newLimit,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
      
      if (profileError) {
        console.error('[Upgrade] Error updating profile:', profileError)
      }
      
      return NextResponse.json({
        success: true,
        upgraded: true,
        message: `Successfully upgraded to ${targetTier === 'pro_plus' ? 'Pro+' : 'Pro'}!`
      })
    }
    
    // If user is on trial WITHOUT payment method, they need to go through checkout
    if (isTrialing && !hasPaymentMethod) {
      console.log('[Upgrade] Trial user needs to add payment method')
      
      const successUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?upgraded=true`
      const cancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`
      
      const checkoutResult = await creemService.createCheckoutSession({
        userId,
        userEmail: userEmail || '',
        planId: targetTier as 'pro' | 'pro_plus',
        successUrl,
        cancelUrl,
        currentPlan: currentTier as 'free' | 'pro' | 'pro_plus'
      })
      
      if (!checkoutResult.success) {
        return NextResponse.json(
          { error: checkoutResult.error || 'Failed to create checkout session' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        success: true,
        checkoutUrl: checkoutResult.url,
        message: 'Redirecting to payment page to complete upgrade'
      })
    }
    
    // For paid subscriptions (non-trial), use regular upgrade flow
    if (!isTrialing) {
      // For paid subscriptions, use Creem's upgrade API
      const upgradeResult = await creemService.upgradeSubscription(
        subscription.stripe_subscription_id,
        targetTier as 'pro' | 'pro_plus'
      )
      
      if (!upgradeResult.success) {
        return NextResponse.json(
          { error: upgradeResult.error || 'Failed to upgrade subscription' },
          { status: 500 }
        )
      }
      
      // Update local subscription record
      const config = getSubscriptionConfig()
      const newLimit = targetTier === 'pro_plus' 
        ? config.limits.pro_plus.monthly 
        : config.limits.pro.monthly
      
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          tier: targetTier,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
      
      if (updateError) {
        console.error('[Upgrade] Error updating subscription:', updateError)
      }
      
      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_tier: targetTier,
          quota_limit: newLimit,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
      
      if (profileError) {
        console.error('[Upgrade] Error updating profile:', profileError)
      }
      
      return NextResponse.json({
        success: true,
        message: 'Subscription upgraded successfully'
      })
    }
  } catch (error) {
    console.error('[Upgrade] Error:', error)
    return NextResponse.json(
      { error: 'Failed to upgrade subscription' },
      { status: 500 }
    )
  }
}