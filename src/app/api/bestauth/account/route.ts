// BestAuth Account API
import { NextRequest, NextResponse } from 'next/server'
import { validateSessionFromRequest } from '@/lib/bestauth'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'
import { db } from '@/lib/bestauth/db'

// GET /api/bestauth/account - Get account information
export async function GET(request: NextRequest) {
  console.log('[BestAuth Account API] Request received')
  
  try {
    const session = await validateSessionFromRequest(request)
    console.log('[BestAuth Account API] Session validation:', session.success)
    
    if (!session.success || !session.data) {
      console.error('[BestAuth Account API] Unauthorized - no valid session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.data.user.id
    console.log('[BestAuth Account API] User ID:', userId)
    
    // Get user, profile, subscription, and payment history
    console.log('[BestAuth Account API] Fetching user data...')
    
    // Fetch data with individual error handling
    const user = await db.users.findById(userId).catch(err => {
      console.error('[BestAuth Account API] Error fetching user:', err)
      return null
    })
    
    const profile = await bestAuthSubscriptionService.getUserProfile(userId).catch(err => {
      console.error('[BestAuth Account API] Error fetching profile:', err)
      return null
    })
    
    const subscription = await bestAuthSubscriptionService.getUserSubscription(userId).catch(err => {
      console.error('[BestAuth Account API] Error fetching subscription:', err)
      return null
    })
    
    const payments = await bestAuthSubscriptionService.getPaymentHistory(userId, 5).catch(err => {
      console.error('[BestAuth Account API] Error fetching payments:', err)
      return []
    })
    
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
        stripeCustomerId: null // TODO: Get from subscription record if needed
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
    const session = await validateSessionFromRequest(request)
    
    if (!session.success || !session.data) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.data.user.id
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