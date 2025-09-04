import { NextRequest, NextResponse } from 'next/server'
import { creemService, WebhookEvent } from '@/services/payment/creem'
import { supabase } from '@/lib/supabase'

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

      case 'subscription_update':
        await handleSubscriptionUpdate(result)
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
  const { userId, customerId, subscriptionId, planId } = data

  if (!userId || !planId) {
    console.error('[Webhook] Missing required data for checkout complete')
    return
  }

  try {
    // Create service role client for admin operations
    const adminSupabase = createAdminSupabaseClient()

    // Get the plan details
    const planLimits = {
      pro: 120,
      pro_plus: 300
    }

    // Update or create subscription record
    const { error: subError } = await adminSupabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        tier: planId,
        status: 'active',
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }, {
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
        quota_limit: planLimits[planId as keyof typeof planLimits] || 10,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (profileError) {
      console.error('[Webhook] Error updating profile:', profileError)
      throw profileError
    }

    console.log(`[Webhook] Successfully activated ${planId} subscription for user ${userId}`)
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
    const { error } = await adminSupabase
      .from('subscriptions')
      .update({
        status: status,
        current_period_end: currentPeriodEnd?.toISOString(),
        cancel_at_period_end: cancelAtPeriodEnd,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', customerId)

    if (error) {
      console.error('[Webhook] Error updating subscription:', error)
      throw error
    }

    // If subscription is cancelled or expired, update user tier
    if (status === 'canceled' || status === 'expired') {
      await downgradeUserToFree(userId || customerId)
    }

    console.log(`[Webhook] Updated subscription status to ${status} for customer ${customerId}`)
  } catch (error) {
    console.error('[Webhook] Error in handleSubscriptionUpdate:', error)
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
      .from('subscriptions')
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
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', userIdOrCustomerId)
        .single()
      
      if (subscription) {
        userId = subscription.user_id
      }
    }

    // Update subscription to free/cancelled
    const { error: subError } = await adminSupabase
      .from('subscriptions')
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
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .update({
        subscription_tier: 'free',
        quota_limit: 10,
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