import { NextRequest, NextResponse } from 'next/server'
import { creemService, WebhookEvent } from '@/services/payment/creem'
import { supabase } from '@/lib/supabase'
import { getSubscriptionConfig, calculateTrialEndDate } from '@/lib/subscription-config'

// Disable body parsing to get raw body for signature verification
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await req.text()
    const signature = req.headers.get('creem-signature') || ''

    // Verify webhook signature
    if (process.env.CREEM_WEBHOOK_SECRET) {
      const isValid = creemService.verifyWebhookSignature(rawBody, signature)
      if (!isValid) {
        console.error('Invalid webhook signature')
        console.error('Expected header: creem-signature')
        console.error('Received signature:', signature ? 'present' : 'missing')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.warn('CREEM_WEBHOOK_SECRET not configured - webhook verification disabled')
    }

    // Parse the webhook event
    const event = JSON.parse(rawBody)
    const eventType = event.eventType || event.type
    console.log(`[Webhook] Received event: ${eventType}`, event.id)

    // Handle the webhook event
    const result = await creemService.handleWebhookEvent(event)

    // Check if result has a type property
    if (!result || typeof result !== 'object' || !('type' in result)) {
      console.log('[Webhook] Event processed successfully')
      return NextResponse.json({ received: true })
    }

    // Process the result based on event type
    switch ((result as any).type) {
      case 'checkout_complete':
        await handleCheckoutComplete(result)
        break

      case 'subscription_created':
        await handleSubscriptionCreated(result)
        break

      case 'subscription_update':
        await handleSubscriptionUpdate(result)
        break

      case 'subscription_trial_will_end':
        await handleSubscriptionTrialWillEnd(result)
        break

      case 'subscription_trial_ended':
        await handleSubscriptionTrialEnded(result)
        break

      case 'subscription_deleted':
        await handleSubscriptionDeleted(result)
        break

      case 'payment_success':
        await handlePaymentSuccess(result)
        break

      case 'payment_failed':
        await handlePaymentFailed(result)
        break

      case 'subscription_paused':
        await handleSubscriptionPaused(result)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutComplete(data: any) {
  const { userId, customerId, subscriptionId, planId, trialEnd } = data

  console.log('[Webhook] Checkout complete data:', { 
    userId, 
    customerId, 
    subscriptionId, 
    planId, 
    hasSubscriptionId: !!subscriptionId 
  })

  if (!userId || !planId) {
    console.error('[Webhook] Missing required data for checkout complete')
    return
  }

  try {
    // Create service role client for admin operations
    const adminSupabase = createAdminSupabaseClient()

    // Mark the checkout session as completed
    if (subscriptionId) {
      const { error: completeError } = await adminSupabase
        .rpc('complete_checkout_session', {
          p_session_id: subscriptionId,
          p_subscription_id: subscriptionId
        })

      if (completeError) {
        console.error('[Webhook] Error marking checkout session as completed:', completeError)
      } else {
        console.log('[Webhook] Marked checkout session as completed:', subscriptionId)
      }
    }

    // Get subscription configuration
    const config = getSubscriptionConfig()
    
    // Get the plan details from configuration
    const planLimits = {
      pro: config.limits.pro.monthly,
      pro_plus: config.limits.pro_plus.monthly
    }

    // Check if this is a trial subscription
    // Trust the webhook data - if trialEnd is provided and in the future, it's a trial
    let isTrialSubscription = false
    let trialEndsAt: string | null = null
    
    if (trialEnd && new Date(trialEnd) > new Date()) {
      isTrialSubscription = true
      trialEndsAt = new Date(trialEnd).toISOString()
      console.log('[Webhook] Checkout complete with trial ending at:', trialEndsAt)
    } else if (subscriptionId) {
      // If we have a subscription ID but no trial info, the subscription.created webhook
      // will provide the actual trial dates from Stripe
      console.log('[Webhook] Checkout complete without trial info, waiting for subscription.created webhook')
    }

    // Update auth.users table with Creem trial info using raw SQL
    // Note: Supabase doesn't allow direct updates to auth.users via API, so we use RPC
    if (isTrialSubscription) {
      const { error: rpcError } = await adminSupabase.rpc('update_user_trial_status', {
        p_user_id: userId,
        p_trial_ends_at: trialEndsAt,
        p_subscription_tier: planId
      })
      
      if (rpcError) {
        console.error('[Webhook] Error updating user trial status:', rpcError)
      }
    }

    // Update or create subscription record
    // NOTE: subscriptionId might be null for checkout.completed if subscription is created async
    const subscriptionData: any = {
      user_id: userId,
      tier: planId,
      status: isTrialSubscription ? 'trialing' : 'active',
      stripe_customer_id: customerId,
      current_period_start: new Date().toISOString(),
      current_period_end: trialEndsAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // If this is a trial subscription, set trial dates
    if (isTrialSubscription && trialEndsAt) {
      subscriptionData.trial_started_at = new Date().toISOString()
      subscriptionData.expires_at = trialEndsAt
    }
    
    // Only set subscription ID if we have it
    if (subscriptionId) {
      subscriptionData.stripe_subscription_id = subscriptionId
    } else {
      console.warn('[Webhook] Creating subscription without stripe_subscription_id - will be updated by subscription.created webhook')
    }
    
    const { error: subError } = await adminSupabase
      .from('subscriptions_consolidated')
      .upsert(subscriptionData, {
        onConflict: 'user_id'
      })

    if (subError) {
      console.error('[Webhook] Error updating subscription:', subError)
      throw subError
    }

    // Update user profile with new tier
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .update({
        subscription_tier: planId,
        quota_limit: planLimits[planId as keyof typeof planLimits] || config.limits.free.monthly,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (profileError) {
      console.error('[Webhook] Error updating profile:', profileError)
      throw profileError
    }

    console.log(`[Webhook] Successfully activated ${planId} ${isTrialSubscription ? 'TRIAL' : 'PAID'} subscription for user ${userId}`)
    if (isTrialSubscription) {
      console.log(`[Webhook] Trial ends at: ${trialEndsAt}`)
    }
  } catch (error) {
    console.error('[Webhook] Error in handleCheckoutComplete:', error)
    throw error
  }
}

async function handleSubscriptionUpdate(data: any) {
  const { customerId, status, userId, planId, currentPeriodEnd, cancelAtPeriodEnd } = data

  try {
    const adminSupabase = createAdminSupabaseClient()

    // Update subscription status
    const updateData: any = {
      status: status,
      current_period_end: currentPeriodEnd?.toISOString(),
      cancel_at_period_end: cancelAtPeriodEnd,
      updated_at: new Date().toISOString()
    }
    
    // If subscription is being cancelled, set expires_at
    if (cancelAtPeriodEnd && currentPeriodEnd) {
      updateData.expires_at = currentPeriodEnd.toISOString()
    }
    
    const { error } = await adminSupabase
      .from('subscriptions_consolidated')
      .update(updateData)
      .eq('stripe_customer_id', customerId)

    if (error) {
      console.error('[Webhook] Error updating subscription:', error)
      throw error
    }

    // If subscription is cancelled or expired, update user tier
    if (status === 'canceled' || status === 'expired') {
      await downgradeUserToFree(userId || customerId)
    }
    
    // If subscription transitions from trialing to active, clear trial data
    if (status === 'active') {
      // Clear trial end date from auth.users
      const { error: rpcError } = await adminSupabase.rpc('update_user_trial_status', {
        p_user_id: userId,
        p_trial_ends_at: null,
        p_subscription_tier: planId
      })
      
      if (rpcError) {
        console.error('[Webhook] Error clearing trial status:', rpcError)
      }
      
      console.log(`[Webhook] Trial converted to paid subscription for user ${userId}`)
    }

    console.log(`[Webhook] Updated subscription status to ${status} for customer ${customerId}`)
  } catch (error) {
    console.error('[Webhook] Error in handleSubscriptionUpdate:', error)
    throw error
  }
}

async function handleSubscriptionCreated(data: any) {
  const { subscriptionId, customerId, userId, status, planId, trialStart, trialEnd, currentPeriodStart, currentPeriodEnd } = data

  if (!subscriptionId || !customerId) {
    console.error('[Webhook] Missing subscription ID or customer ID')
    return
  }

  try {
    const adminSupabase = createAdminSupabaseClient()

    // Build update data
    const updateData: any = {
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      status: status || 'active',
      updated_at: new Date().toISOString()
    }

    // Add tier/planId if available
    if (planId) {
      updateData.tier = planId
    }

    // Add trial dates if this is a trial subscription
    if (status === 'trialing' && trialStart && trialEnd) {
      updateData.trial_started_at = trialStart.toISOString()
      updateData.expires_at = trialEnd.toISOString()
    }

    // Add period dates
    if (currentPeriodStart) {
      updateData.current_period_start = currentPeriodStart.toISOString()
    }
    if (currentPeriodEnd) {
      updateData.current_period_end = currentPeriodEnd.toISOString()
    }

    // Update existing subscription record with the subscription ID and trial dates
    // First try to update in subscriptions_consolidated table
    const { data: updatedSubs, error } = await adminSupabase
      .from('subscriptions_consolidated')
      .update(updateData)
      .eq('stripe_customer_id', customerId)
      .is('stripe_subscription_id', null) // Only update if subscription ID is missing
      .select()

    if (error || !updatedSubs || updatedSubs.length === 0) {
      // If update fails, try by user_id
      const { data: userUpdatedSubs, error: userError } = await adminSupabase
        .from('subscriptions_consolidated')
        .update(updateData)
        .eq('user_id', userId)
        .is('stripe_subscription_id', null)
        .select()
      
      if (userError || !userUpdatedSubs || userUpdatedSubs.length === 0) {
        console.error('[Webhook] No subscription found to update or error:', userError)
        
        // If no existing subscription found, this might be a race condition
        // Create a new subscription record
        if (userId) {
          const createData = {
            ...updateData,
            user_id: userId
          }
          
          const { error: createError } = await adminSupabase
            .from('subscriptions_consolidated')
            .insert(createData)
          
          if (createError) {
            console.error('[Webhook] Error creating subscription:', createError)
          } else {
            console.log('[Webhook] Created new subscription record for user:', userId)
          }
        }
      } else {
        console.log('[Webhook] Updated subscription by user_id:', userId)
      }
    } else {
      console.log('[Webhook] Updated subscription by customer_id:', customerId)
    }

    // Also update trial dates in auth.users if this is a trial
    if (status === 'trialing' && trialEnd && userId) {
      const { error: rpcError } = await adminSupabase.rpc('update_user_trial_status', {
        p_user_id: userId,
        p_trial_ends_at: trialEnd.toISOString(),
        p_subscription_tier: planId || 'pro'
      })
      
      if (rpcError) {
        console.error('[Webhook] Error updating user trial status:', rpcError)
      }
    }

    console.log(`[Webhook] Updated subscription ${subscriptionId} for customer ${customerId}`)
    if (status === 'trialing') {
      console.log(`[Webhook] Trial period: ${trialStart?.toISOString()} to ${trialEnd?.toISOString()}`)
    }
  } catch (error) {
    console.error('[Webhook] Error in handleSubscriptionCreated:', error)
    throw error
  }
}

async function handleSubscriptionDeleted(data: any) {
  const { customerId, userId } = data

  try {
    // Downgrade user to free tier
    await downgradeUserToFree(userId || customerId)
    
    console.log(`[Webhook] Subscription deleted for customer ${customerId}`)
  } catch (error) {
    console.error('[Webhook] Error in handleSubscriptionDeleted:', error)
    throw error
  }
}

async function handlePaymentSuccess(data: any) {
  const { customerId, subscriptionId, userId } = data

  try {
    const adminSupabase = createAdminSupabaseClient()

    // Reset monthly usage on successful payment
    const { error } = await adminSupabase
      .from('user_usage')
      .update({
        generation_count: 0,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('date', new Date().toISOString().split('T')[0])

    if (error && error.code !== 'PGRST116') { // Ignore "no rows" error
      console.error('[Webhook] Error resetting usage:', error)
    }

    console.log(`[Webhook] Payment successful for subscription ${subscriptionId}`)
  } catch (error) {
    console.error('[Webhook] Error in handlePaymentSuccess:', error)
  }
}

async function handlePaymentFailed(data: any) {
  const { customerId, subscriptionId, userId } = data

  console.log(`[Webhook] Payment failed for subscription ${subscriptionId}`)

  // You could send an email notification here
  // Or update a payment_failed flag in the database
}

async function handleSubscriptionPaused(data: any) {
  const { customerId, subscriptionId, userId } = data

  try {
    const adminSupabase = createAdminSupabaseClient()

    // Update subscription status to paused
    const { error } = await adminSupabase
      .from('subscriptions_consolidated')
      .update({
        status: 'paused',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId)

    if (error) {
      console.error('[Webhook] Error updating subscription to paused:', error)
      throw error
    }

    console.log(`[Webhook] Subscription ${subscriptionId} paused`)
  } catch (error) {
    console.error('[Webhook] Error in handleSubscriptionPaused:', error)
    throw error
  }
}

async function downgradeUserToFree(userIdOrCustomerId: string) {
  try {
    const adminSupabase = createAdminSupabaseClient()

    // First try to find user by ID
    let userId = userIdOrCustomerId
    
    // If it's a customer ID, find the user
    if (userIdOrCustomerId.startsWith('cus_')) {
      const { data: subscription } = await adminSupabase
        .from('subscriptions_consolidated')
        .select('user_id')
        .eq('stripe_customer_id', userIdOrCustomerId)
        .single()
      
      if (subscription) {
        userId = subscription.user_id
      }
    }

    // Update subscription to free/cancelled
    const { error: subError } = await adminSupabase
      .from('subscriptions_consolidated')
      .update({
        tier: 'free',
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (subError) {
      console.error('[Webhook] Error updating subscription to free:', subError)
    }

    // Update user profile to free tier
    const config = getSubscriptionConfig()
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .update({
        subscription_tier: 'free',
        quota_limit: config.limits.free.monthly,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (profileError) {
      console.error('[Webhook] Error updating profile to free:', profileError)
    }

    console.log(`[Webhook] User ${userId} downgraded to free tier`)
  } catch (error) {
    console.error('[Webhook] Error downgrading user:', error)
    throw error
  }
}

// Handler for subscription trial will end event (notification before trial ends)
async function handleSubscriptionTrialWillEnd(data: any) {
  const { customerId, userId, planId, trialEndDate } = data

  try {
    console.log(`[Webhook] Trial will end soon for user ${userId}, trial ends at ${trialEndDate}`)
    
    // TODO: Send email notification to user about upcoming trial end
    // This would be handled by your email service
    
    // Log the upcoming trial end for monitoring
    const adminSupabase = createAdminSupabaseClient()
    
    // You could also store this in a notifications table for the user
    console.log(`[Webhook] User ${userId} should be notified that their trial ends on ${trialEndDate}`)
  } catch (error) {
    console.error('[Webhook] Error in handleSubscriptionTrialWillEnd:', error)
    // Don't throw - this is just a notification
  }
}

// Handler for subscription trial ended event (auto-conversion to paid)
async function handleSubscriptionTrialEnded(data: any) {
  const { customerId, userId, planId, subscriptionId } = data

  try {
    const adminSupabase = createAdminSupabaseClient()
    
    console.log(`[Webhook] Trial ended for user ${userId}, converting to paid subscription`)
    
    // Update subscription status from trialing to active
    const { error: subError } = await adminSupabase
      .from('subscriptions_consolidated')
      .update({
        status: 'active',
        trial_ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (subError) {
      console.error('[Webhook] Error updating subscription to active:', subError)
      throw subError
    }
    
    // Clear trial data from auth.users
    const { error: rpcError } = await adminSupabase.rpc('update_user_trial_status', {
      p_user_id: userId,
      p_trial_ends_at: null,
      p_subscription_tier: planId
    })
    
    if (rpcError) {
      console.error('[Webhook] Error clearing trial status:', rpcError)
    }
    
    console.log(`[Webhook] Successfully converted trial to paid subscription for user ${userId}`)
  } catch (error) {
    console.error('[Webhook] Error in handleSubscriptionTrialEnded:', error)
    throw error
  }
}

// Helper to create admin Supabase client
function createAdminSupabaseClient() {
  const { createClient } = require('@supabase/supabase-js')
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}