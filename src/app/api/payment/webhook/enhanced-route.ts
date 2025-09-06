import { NextRequest, NextResponse } from 'next/server'
import { creemService } from '@/services/payment/creem'
import { createClient } from '@supabase/supabase-js'

// Create Supabase admin client for webhook processing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-creem-signature') || ''
  
  // Verify webhook signature
  if (!creemService.verifyWebhookSignature(body, signature)) {
    console.error('[Webhook] Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event
  try {
    event = JSON.parse(body)
  } catch (error) {
    console.error('[Webhook] Invalid JSON:', error)
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  console.log('[Webhook] Processing event:', {
    type: event.eventType || event.type,
    id: event.id,
    metadata: event.object?.metadata || event.metadata
  })

  try {
    const result = await creemService.handleWebhookEvent(event)
    
    // Handle checkout completion (new subscription or trial start)
    if (result?.type === 'checkout_complete' && result.userId) {
      const { userId, customerId, subscriptionId, planId, isTrialCheckout, trialDays } = result as any
      
      // Calculate all necessary timestamps
      const now = new Date()
      let trialStart = null
      let trialEnd = null
      let isTrialActive = false
      let currentPeriodStart = now
      let currentPeriodEnd = new Date(now)
      let subscriptionStartedAt = now
      
      if (isTrialCheckout && trialDays > 0) {
        // Trial subscription
        trialStart = now
        trialEnd = new Date(now)
        trialEnd.setDate(trialEnd.getDate() + trialDays)
        isTrialActive = true
        
        // During trial, the actual billing period starts after trial ends
        currentPeriodStart = new Date(trialEnd)
        currentPeriodEnd = new Date(trialEnd)
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)
      } else {
        // Regular subscription without trial
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)
      }
      
      // Check if user already has a subscription (upgrade scenario)
      const { data: existingSub } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      const subscriptionData = {
        user_id: userId,
        tier: planId,
        status: 'active',
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        trial_start: trialStart,
        trial_end: trialEnd,
        is_trial_active: isTrialActive,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        subscription_started_at: subscriptionStartedAt,
        cancel_at_period_end: false,
        updated_at: now
      }
      
      let subscriptionRecord
      
      if (existingSub) {
        // This is an upgrade/change
        const previousTier = existingSub.tier
        
        subscriptionData.previous_tier = previousTier
        subscriptionData.upgraded_at = previousTier && previousTier !== 'free' && planId !== 'free' && 
          (planId === 'pro_plus' || (planId === 'pro' && previousTier === 'free')) ? now : null
        subscriptionData.downgraded_at = previousTier === 'pro_plus' && planId === 'pro' ? now : null
        
        const { data: updated } = await supabaseAdmin
          .from('subscriptions')
          .update(subscriptionData)
          .eq('id', existingSub.id)
          .select()
          .single()
          
        subscriptionRecord = updated
        
        // Record history event
        await supabaseAdmin.rpc('record_subscription_event', {
          p_subscription_id: existingSub.id,
          p_user_id: userId,
          p_event_type: isTrialActive ? 'trial_started' : 
                       (previousTier !== planId ? 'upgraded' : 'renewed'),
          p_from_tier: previousTier,
          p_to_tier: planId,
          p_from_period_end: existingSub.current_period_end,
          p_to_period_end: currentPeriodEnd,
          p_metadata: { 
            creem_subscription_id: subscriptionId,
            is_trial: isTrialActive,
            trial_days: trialDays
          }
        })
      } else {
        // New subscription
        subscriptionData.created_at = now
        
        const { data: inserted } = await supabaseAdmin
          .from('subscriptions')
          .insert(subscriptionData)
          .select()
          .single()
          
        subscriptionRecord = inserted
        
        // Record creation event
        if (subscriptionRecord) {
          await supabaseAdmin.rpc('record_subscription_event', {
            p_subscription_id: subscriptionRecord.id,
            p_user_id: userId,
            p_event_type: isTrialActive ? 'trial_started' : 'created',
            p_from_tier: null,
            p_to_tier: planId,
            p_from_period_end: null,
            p_to_period_end: currentPeriodEnd,
            p_metadata: { 
              creem_subscription_id: subscriptionId,
              is_trial: isTrialActive,
              trial_days: trialDays
            }
          })
        }
      }
      
      console.log('[Webhook] Subscription processed:', {
        userId,
        planId,
        isTrialActive,
        trialEnd,
        subscriptionId: subscriptionRecord?.id
      })
    }
    
    // Handle subscription updates (renewals, trial conversions, plan changes)
    if (result?.type === 'subscription_updated' && result.customerId) {
      const { customerId, status, planId, currentPeriodEnd, metadata } = result as any
      
      // Find subscription by customer ID
      const { data: subscription } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('stripe_customer_id', customerId)
        .single()
      
      if (subscription) {
        const now = new Date()
        const updateData: any = {
          status: status,
          updated_at: now
        }
        
        let eventType = 'renewed' // default event type
        
        // Check if this is a trial conversion
        if (subscription.is_trial_active && subscription.trial_end) {
          const trialEndDate = new Date(subscription.trial_end)
          
          if (now >= trialEndDate || metadata?.convertedFromTrial) {
            // Trial has ended or manually converted
            updateData.is_trial_active = false
            updateData.converted_from_trial = true
            updateData.current_period_start = now
            updateData.current_period_end = currentPeriodEnd || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
            eventType = 'trial_converted'
            
            console.log('[Webhook] Trial converted to paid:', {
              userId: subscription.user_id,
              planId: subscription.tier
            })
          }
        } else if (currentPeriodEnd && subscription.current_period_end) {
          // Check if this is a renewal (period end extended)
          const oldPeriodEnd = new Date(subscription.current_period_end)
          const newPeriodEnd = new Date(currentPeriodEnd)
          
          if (newPeriodEnd > oldPeriodEnd) {
            updateData.last_renewal_at = now
            updateData.renewal_count = (subscription.renewal_count || 0) + 1
            updateData.current_period_start = oldPeriodEnd // Renewal starts when old period ended
            updateData.current_period_end = newPeriodEnd
            eventType = 'renewed'
          }
        }
        
        // Handle plan changes
        if (planId && planId !== subscription.tier) {
          const isUpgrade = (planId === 'pro_plus' && subscription.tier === 'pro') ||
                           (planId !== 'free' && subscription.tier === 'free')
          
          updateData.previous_tier = subscription.tier
          updateData.tier = planId
          
          if (isUpgrade) {
            updateData.upgraded_at = now
            eventType = 'upgraded'
          } else {
            updateData.downgraded_at = now
            eventType = 'downgraded'
          }
        }
        
        const { data: updated } = await supabaseAdmin
          .from('subscriptions')
          .update(updateData)
          .eq('id', subscription.id)
          .select()
          .single()
        
        // Record history event
        if (updated) {
          await supabaseAdmin.rpc('record_subscription_event', {
            p_subscription_id: subscription.id,
            p_user_id: subscription.user_id,
            p_event_type: eventType,
            p_from_tier: subscription.tier,
            p_to_tier: planId || subscription.tier,
            p_from_period_end: subscription.current_period_end,
            p_to_period_end: currentPeriodEnd || subscription.current_period_end,
            p_metadata: { 
              status: status,
              renewal_count: updateData.renewal_count
            }
          })
        }
      }
    }
    
    // Handle subscription cancellation
    if (result?.type === 'subscription_deleted' && result.customerId) {
      const { data: subscription } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('stripe_customer_id', result.customerId)
        .single()
      
      if (subscription) {
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancel_at_period_end: true,
            updated_at: new Date()
          })
          .eq('id', subscription.id)
        
        // Record cancellation event
        await supabaseAdmin.rpc('record_subscription_event', {
          p_subscription_id: subscription.id,
          p_user_id: subscription.user_id,
          p_event_type: 'cancelled',
          p_from_tier: subscription.tier,
          p_to_tier: subscription.tier,
          p_metadata: { 
            cancelled_at: new Date()
          }
        })
      }
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Webhook] Processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'Enhanced webhook endpoint active' })
}