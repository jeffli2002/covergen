import { NextRequest, NextResponse } from 'next/server'
import { creemService } from '@/services/payment/creem'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'
import { db } from '@/lib/bestauth/db-wrapper'
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
        console.error('[BestAuth Webhook] Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.warn('[BestAuth Webhook] CREEM_WEBHOOK_SECRET not configured - webhook verification disabled')
    }

    // Parse the webhook event
    const event = JSON.parse(rawBody)
    const eventType = event.eventType || event.type
    console.log(`[BestAuth Webhook] Received event: ${eventType}`, event.id)

    // Handle the webhook event
    const result = await creemService.handleWebhookEvent(event)

    // Check if result has a type property
    if (!result || typeof result !== 'object' || !('type' in result)) {
      console.log('[BestAuth Webhook] Event processed successfully')
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

      case 'refund_created':
        await handleRefundCreated(result)
        break

      case 'dispute_created':
        await handleDisputeCreated(result)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[BestAuth Webhook] Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutComplete(data: any) {
  const { userId, customerId, subscriptionId, planId, trialEnd } = data

  console.log('[BestAuth Webhook] Checkout complete:', { 
    userId, 
    customerId, 
    subscriptionId, 
    planId, 
    hasSubscriptionId: !!subscriptionId,
    hasTrialEnd: !!trialEnd
  })

  if (!userId || !planId) {
    console.error('[BestAuth Webhook] Missing required data for checkout complete')
    return
  }

  try {
    const config = getSubscriptionConfig()
    
    // Check if this is a trial subscription
    let isTrialSubscription = false
    let trialEndsAt: Date | undefined
    
    if (trialEnd && new Date(trialEnd) > new Date()) {
      isTrialSubscription = true
      trialEndsAt = new Date(trialEnd)
      console.log('[BestAuth Webhook] Checkout complete with trial ending at:', trialEndsAt)
    }

    // Create or update subscription
    const subscriptionData: any = {
      userId,
      tier: planId,
      status: isTrialSubscription ? 'trialing' : 'active',
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: trialEndsAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      trialEndsAt: trialEndsAt,
      metadata: {
        checkout_completed_at: new Date().toISOString(),
        had_trial: isTrialSubscription
      }
    }

    await bestAuthSubscriptionService.createOrUpdateSubscription(subscriptionData)

    console.log(`[BestAuth Webhook] Successfully processed checkout for user ${userId} - ${planId} ${isTrialSubscription ? 'TRIAL' : 'PAID'}`)
  } catch (error) {
    console.error('[BestAuth Webhook] Error in handleCheckoutComplete:', error)
    throw error
  }
}

async function handleSubscriptionCreated(data: any) {
  const { subscriptionId, customerId, userId, status, planId, trialStart, trialEnd, currentPeriodStart, currentPeriodEnd } = data

  if (!subscriptionId || !customerId) {
    console.error('[BestAuth Webhook] Missing subscription ID or customer ID')
    return
  }

  try {
    // Update subscription with full details
    const subscriptionData: any = {
      userId: userId || customerId, // Fallback to customerId if no userId
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: customerId,
      status: status || 'active',
      tier: planId
    }

    // Add trial dates if this is a trial subscription
    if (status === 'trialing' && trialEnd) {
      subscriptionData.trialEndsAt = trialEnd
      subscriptionData.metadata = {
        trial_started_at: trialStart?.toISOString(),
        trial_period_days: Math.ceil((trialEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      }
    }

    // Add period dates
    if (currentPeriodStart) {
      subscriptionData.currentPeriodStart = currentPeriodStart
    }
    if (currentPeriodEnd) {
      subscriptionData.currentPeriodEnd = currentPeriodEnd
    }

    await bestAuthSubscriptionService.createOrUpdateSubscription(subscriptionData)

    console.log(`[BestAuth Webhook] Created/Updated subscription ${subscriptionId} for customer ${customerId}`)
  } catch (error) {
    console.error('[BestAuth Webhook] Error in handleSubscriptionCreated:', error)
    throw error
  }
}

async function handleSubscriptionUpdate(data: any) {
  const { customerId, status, userId, planId, currentPeriodEnd, cancelAtPeriodEnd } = data

  try {
    // Find user by customer ID if userId not provided
    let actualUserId = userId
    if (!actualUserId && customerId) {
      const subscription = await db.subscriptions.findByCustomerId(customerId)
      if (subscription) {
        actualUserId = subscription.user_id
      }
    }

    if (!actualUserId) {
      console.error('[BestAuth Webhook] Could not find user for customer:', customerId)
      return
    }

    // Update subscription status
    const updateData: any = {
      userId: actualUserId,
      status: status,
      currentPeriodEnd: currentPeriodEnd,
      cancelAtPeriodEnd: cancelAtPeriodEnd
    }

    if (planId) {
      updateData.tier = planId
    }

    // Handle status transitions
    if (status === 'active' && cancelAtPeriodEnd) {
      // Subscription is active but will cancel at period end
      updateData.cancelledAt = new Date()
    } else if (status === 'cancelled' || status === 'expired') {
      // Subscription has ended, downgrade to free
      updateData.tier = 'free'
      updateData.stripeSubscriptionId = undefined
      updateData.stripePaymentMethodId = undefined
    } else if (status === 'past_due') {
      // Payment failed, mark as past due
      updateData.metadata = {
        payment_failed_at: new Date().toISOString(),
        requires_payment_update: true
      }
    }

    await bestAuthSubscriptionService.createOrUpdateSubscription(updateData)

    console.log(`[BestAuth Webhook] Updated subscription status to ${status} for user ${actualUserId}`)
  } catch (error) {
    console.error('[BestAuth Webhook] Error in handleSubscriptionUpdate:', error)
    throw error
  }
}

async function handleSubscriptionDeleted(data: any) {
  const { customerId, userId } = data

  try {
    // Find user
    let actualUserId = userId
    if (!actualUserId && customerId) {
      const subscription = await db.subscriptions.findByCustomerId(customerId)
      if (subscription) {
        actualUserId = subscription.user_id
      }
    }

    if (!actualUserId) {
      console.error('[BestAuth Webhook] Could not find user for cancelled subscription')
      return
    }

    // Downgrade to free tier
    await bestAuthSubscriptionService.createOrUpdateSubscription({
      userId: actualUserId,
      tier: 'free',
      status: 'cancelled',
      stripeSubscriptionId: undefined,
      stripePaymentMethodId: undefined,
      cancelledAt: new Date()
    })

    console.log(`[BestAuth Webhook] Subscription cancelled for user ${actualUserId}`)
  } catch (error) {
    console.error('[BestAuth Webhook] Error in handleSubscriptionDeleted:', error)
    throw error
  }
}

async function handlePaymentSuccess(data: any) {
  const { customerId, subscriptionId, userId } = data

  try {
    let actualUserId = userId
    if (!actualUserId && customerId) {
      const subscription = await db.subscriptions.findByCustomerId(customerId)
      if (subscription) {
        actualUserId = subscription.user_id
      }
    }

    if (!actualUserId) {
      console.error('[BestAuth Webhook] Could not find user for payment success')
      return
    }

    // Record payment
    await bestAuthSubscriptionService.recordPayment({
      userId: actualUserId,
      amount: 0, // Amount should be in the webhook data
      currency: 'USD',
      status: 'succeeded',
      description: 'Subscription payment',
      metadata: {
        subscription_id: subscriptionId,
        customer_id: customerId
      }
    })

    // Update subscription to ensure it has payment method
    await bestAuthSubscriptionService.createOrUpdateSubscription({
      userId: actualUserId,
      stripePaymentMethodId: 'pm_' + Date.now(), // Placeholder, should get from webhook
      metadata: {
        last_payment_at: new Date().toISOString(),
        payment_status: 'succeeded'
      }
    })

    console.log(`[BestAuth Webhook] Payment successful for subscription ${subscriptionId}`)
  } catch (error) {
    console.error('[BestAuth Webhook] Error in handlePaymentSuccess:', error)
  }
}

async function handlePaymentFailed(data: any) {
  const { customerId, subscriptionId, userId } = data

  console.log(`[BestAuth Webhook] Payment failed for subscription ${subscriptionId}`)

  try {
    let actualUserId = userId
    if (!actualUserId && customerId) {
      const subscription = await db.subscriptions.findByCustomerId(customerId)
      if (subscription) {
        actualUserId = subscription.user_id
      }
    }

    if (!actualUserId) {
      console.error('[BestAuth Webhook] Could not find user for payment failure')
      return
    }

    // Update subscription with payment failure
    await bestAuthSubscriptionService.createOrUpdateSubscription({
      userId: actualUserId,
      status: 'past_due',
      metadata: {
        last_payment_failed_at: new Date().toISOString(),
        payment_status: 'failed',
        requires_payment_update: true
      }
    })

    // Record failed payment
    await bestAuthSubscriptionService.recordPayment({
      userId: actualUserId,
      amount: 0,
      currency: 'USD',
      status: 'failed',
      description: 'Subscription payment failed',
      metadata: {
        subscription_id: subscriptionId,
        customer_id: customerId,
        failure_reason: 'payment_failed'
      }
    })
  } catch (error) {
    console.error('[BestAuth Webhook] Error in handlePaymentFailed:', error)
  }
}

async function handleSubscriptionPaused(data: any) {
  const { customerId, subscriptionId, userId } = data

  try {
    let actualUserId = userId
    if (!actualUserId && customerId) {
      const subscription = await db.subscriptions.findByCustomerId(customerId)
      if (subscription) {
        actualUserId = subscription.user_id
      }
    }

    if (!actualUserId) {
      console.error('[BestAuth Webhook] Could not find user for paused subscription')
      return
    }

    // Update subscription status to paused
    await bestAuthSubscriptionService.createOrUpdateSubscription({
      userId: actualUserId,
      status: 'paused',
      metadata: {
        paused_at: new Date().toISOString(),
        paused_reason: 'payment_issue'
      }
    })

    console.log(`[BestAuth Webhook] Subscription ${subscriptionId} paused`)
  } catch (error) {
    console.error('[BestAuth Webhook] Error in handleSubscriptionPaused:', error)
    throw error
  }
}

async function handleSubscriptionTrialWillEnd(data: any) {
  const { customerId, userId, planId, trialEndDate } = data

  try {
    console.log(`[BestAuth Webhook] Trial will end soon for user ${userId}, trial ends at ${trialEndDate}`)
    
    // TODO: Send email notification to user about upcoming trial end
    // This would be handled by your email service
    
    // Update subscription metadata
    if (userId) {
      await bestAuthSubscriptionService.createOrUpdateSubscription({
        userId,
        metadata: {
          trial_ending_notification_sent: true,
          trial_ending_notification_date: new Date().toISOString()
        }
      })
    }
  } catch (error) {
    console.error('[BestAuth Webhook] Error in handleSubscriptionTrialWillEnd:', error)
  }
}

async function handleSubscriptionTrialEnded(data: any) {
  const { customerId, userId, planId, subscriptionId } = data

  try {
    let actualUserId = userId
    if (!actualUserId && customerId) {
      const subscription = await db.subscriptions.findByCustomerId(customerId)
      if (subscription) {
        actualUserId = subscription.user_id
      }
    }

    if (!actualUserId) {
      console.error('[BestAuth Webhook] Could not find user for trial end')
      return
    }

    console.log(`[BestAuth Webhook] Trial ended for user ${actualUserId}, converting to paid subscription`)
    
    // Update subscription from trialing to active
    await bestAuthSubscriptionService.createOrUpdateSubscription({
      userId: actualUserId,
      status: 'active',
      trialEndsAt: undefined, // Clear trial end date
      metadata: {
        trial_ended_at: new Date().toISOString(),
        converted_from_trial: true
      }
    })
    
    console.log(`[BestAuth Webhook] Successfully converted trial to paid subscription for user ${actualUserId}`)
  } catch (error) {
    console.error('[BestAuth Webhook] Error in handleSubscriptionTrialEnded:', error)
    throw error
  }
}

async function handleRefundCreated(data: any) {
  const { customerId, subscriptionId, checkoutId, amount } = data

  try {
    // Find user
    let userId: string | undefined
    if (customerId) {
      const subscription = await db.subscriptions.findByCustomerId(customerId)
      if (subscription) {
        userId = subscription.user_id
      }
    }

    if (userId) {
      // Record refund
      await bestAuthSubscriptionService.recordPayment({
        userId,
        amount: -amount, // Negative amount for refund
        currency: 'USD',
        status: 'refunded',
        description: 'Subscription refund',
        metadata: {
          subscription_id: subscriptionId,
          refund_reason: 'customer_request',
          checkout_id: checkoutId
        }
      })
    }

    console.log(`[BestAuth Webhook] Refund processed for amount ${amount}`)
  } catch (error) {
    console.error('[BestAuth Webhook] Error in handleRefundCreated:', error)
  }
}

async function handleDisputeCreated(data: any) {
  const { customerId, subscriptionId, amount } = data

  try {
    // Log dispute for monitoring
    console.log(`[BestAuth Webhook] Dispute created for customer ${customerId}, amount: ${amount}`)
    
    // TODO: Handle dispute - pause subscription, notify admin, etc.
  } catch (error) {
    console.error('[BestAuth Webhook] Error in handleDisputeCreated:', error)
  }
}