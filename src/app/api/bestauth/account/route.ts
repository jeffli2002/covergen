// BestAuth Account API
import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/bestauth'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'
import { db } from '@/lib/bestauth/db'

// GET /api/bestauth/account - Get account information
export async function GET(request: NextRequest) {
  try {
    const session = await validateSession(request)
    
    if (!session.success || !session.data) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.data.userId
    
    // Get user, profile, subscription, and payment history
    const [user, profile, subscription, payments] = await Promise.all([
      db.users.findById(userId),
      bestAuthSubscriptionService.getUserProfile(userId),
      bestAuthSubscriptionService.getUserSubscription(userId),
      bestAuthSubscriptionService.getPaymentHistory(userId, 5)
    ])
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Format response for compatibility
    const response = {
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name || profile?.full_name,
        avatarUrl: user.avatarUrl || profile?.avatar_url,
        createdAt: user.createdAt
      },
      subscription: subscription ? {
        ...subscription,
        plan: subscription.tier,
        isTrialing: subscription.is_trialing,
        trialDaysRemaining: subscription.trial_days_remaining,
        hasPaymentMethod: subscription.has_payment_method,
        stripeCustomerId: subscription.stripe_customer_id
      } : null,
      payments: payments.map(p => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        description: p.description,
        createdAt: p.created_at
      })),
      usage: subscription ? {
        today: subscription.usage_today,
        limits: {
          daily: subscription.daily_limit,
          monthly: subscription.monthly_limit
        }
      } : {
        today: 0,
        limits: { daily: 3, monthly: 90 }
      }
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Account API error:', error)
    return NextResponse.json(
      { error: 'Failed to get account data' },
      { status: 500 }
    )
  }
}

// PATCH /api/bestauth/account - Update account information
export async function PATCH(request: NextRequest) {
  try {
    const session = await validateSession(request)
    
    if (!session.success || !session.data) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.data.userId
    const updates = await request.json()
    
    // Update user data if provided
    if (updates.name !== undefined || updates.avatarUrl !== undefined) {
      await db.users.update(userId, {
        name: updates.name,
        avatarUrl: updates.avatarUrl
      })
    }
    
    // Update profile data
    if (updates.fullName !== undefined || updates.phone !== undefined || updates.address !== undefined) {
      await bestAuthSubscriptionService.updateUserProfile(userId, {
        fullName: updates.fullName,
        phone: updates.phone,
        address: updates.address
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Account update error:', error)
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    )
  }
}