// BestAuth Account API
import { NextRequest, NextResponse } from 'next/server'
import { validateSessionFromRequest } from '@/lib/bestauth'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'
import { db } from '@/lib/bestauth/db'

// GET /api/bestauth/account - Get account information
export async function GET(request: NextRequest) {
  console.log('[BestAuth Account API] Request received')
  
  try {
    console.log('[BestAuth Account API] Starting session validation...')
    const session = await validateSessionFromRequest(request)
    console.log('[BestAuth Account API] Session validation result:', { 
      success: session.success, 
      hasData: !!session.data,
      hasUser: !!session.data?.user 
    })
    
    if (!session.success || !session.data) {
      console.error('[BestAuth Account API] Unauthorized - no valid session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.data.user.id
    console.log('[BestAuth Account API] User ID:', userId)
    
    // Get user, profile, subscription, and payment history
    console.log('[BestAuth Account API] Fetching user data...')
    
    // Helper function to add timeout to promises
    const withTimeout = <T>(promise: Promise<T>, seconds: number, operation: string): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) => 
          setTimeout(() => reject(new Error(`${operation} timed out after ${seconds}s`)), seconds * 1000)
        )
      ])
    }
    
    // Fetch data with individual error handling, timeouts, and detailed logging
    console.log('[BestAuth Account API] Step 1: Fetching user...')
    const user = await withTimeout(
      db.users.findById(userId), 
      5, 
      'User fetch'
    ).catch(err => {
      console.error('[BestAuth Account API] Error fetching user:', err)
      return null
    })
    console.log('[BestAuth Account API] User fetch complete:', !!user)
    
    console.log('[BestAuth Account API] Step 2: Fetching profile...')
    const profile = await withTimeout(
      bestAuthSubscriptionService.getUserProfile(userId), 
      5, 
      'Profile fetch'
    ).catch(err => {
      console.error('[BestAuth Account API] Error fetching profile:', err)
      return null
    })
    console.log('[BestAuth Account API] Profile fetch complete:', !!profile)
    
    console.log('[BestAuth Account API] Step 3: Fetching subscription...')
    const subscription = await withTimeout(
      bestAuthSubscriptionService.getUserSubscription(userId), 
      10, 
      'Subscription fetch'
    ).catch(err => {
      console.error('[BestAuth Account API] Error fetching subscription:', err)
      return null
    })
    console.log('[BestAuth Account API] Subscription fetch complete:', {
      hasSubscription: !!subscription,
      tier: subscription?.tier,
      status: subscription?.status,
      billing_cycle: subscription?.billing_cycle,
      previous_tier: subscription?.previous_tier
    })
    
    console.log('[BestAuth Account API] Step 4: Fetching usage data...')
    const usageToday = await withTimeout(
      bestAuthSubscriptionService.getUserUsageToday(userId),
      5,
      'Usage today fetch'
    ).catch(err => {
      console.error('[BestAuth Account API] Error fetching usage today:', err)
      return 0
    })
    console.log('[BestAuth Account API] Usage today fetch complete:', usageToday)
    
    const usageThisMonth = await withTimeout(
      bestAuthSubscriptionService.getUserUsageThisMonth(userId),
      5,
      'Usage this month fetch'
    ).catch(err => {
      console.error('[BestAuth Account API] Error fetching usage this month:', err)
      return 0
    })
    console.log('[BestAuth Account API] Usage this month fetch complete:', usageThisMonth)
    
    const videosToday = await withTimeout(
      bestAuthSubscriptionService.getUserVideoUsageToday(userId),
      5,
      'Video usage today fetch'
    ).catch(err => {
      console.error('[BestAuth Account API] Error fetching video usage today:', err)
      return 0
    })
    console.log('[BestAuth Account API] Video usage today fetch complete:', videosToday)
    
    const imagesToday = await withTimeout(
      bestAuthSubscriptionService.getUserImageUsageToday(userId),
      5,
      'Image usage today fetch'
    ).catch(err => {
      console.error('[BestAuth Account API] Error fetching image usage today:', err)
      return 0
    })
    console.log('[BestAuth Account API] Image usage today fetch complete:', imagesToday)
    
    const videosThisMonth = await withTimeout(
      bestAuthSubscriptionService.getUserVideoUsageThisMonth(userId),
      5,
      'Video usage this month fetch'
    ).catch(err => {
      console.error('[BestAuth Account API] Error fetching video usage this month:', err)
      return 0
    })
    console.log('[BestAuth Account API] Video usage this month fetch complete:', videosThisMonth)
    
    const imagesThisMonth = await withTimeout(
      bestAuthSubscriptionService.getUserImageUsageThisMonth(userId),
      5,
      'Image usage this month fetch'
    ).catch(err => {
      console.error('[BestAuth Account API] Error fetching image usage this month:', err)
      return 0
    })
    console.log('[BestAuth Account API] Image usage this month fetch complete:', imagesThisMonth)
    
    console.log('[BestAuth Account API] Step 5: Fetching payments...')
    const payments = await withTimeout(
      bestAuthSubscriptionService.getPaymentHistory(userId, 5), 
      5, 
      'Payments fetch'
    ).catch(err => {
      console.error('[BestAuth Account API] Error fetching payments:', err)
      return []
    })
    console.log('[BestAuth Account API] Payments fetch complete:', payments?.length || 0)
    
    if (!user) {
      console.log('[BestAuth Account API] User not found, returning 404')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    console.log('[BestAuth Account API] Formatting response...')
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
        today: usageToday,
        thisMonth: usageThisMonth,
        images_today: imagesToday,
        videos_today: videosToday,
        images_this_month: imagesThisMonth,
        videos_this_month: videosThisMonth,
        limits: {
          daily: subscription.daily_limit,
          monthly: subscription.monthly_limit
        }
      } : {
        today: usageToday,
        thisMonth: usageThisMonth,
        images_today: imagesToday,
        videos_today: videosToday,
        images_this_month: imagesThisMonth,
        videos_this_month: videosThisMonth,
        limits: { daily: 3, monthly: 90 }
      }
    }
    
    console.log('[BestAuth Account API] Returning response successfully')
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
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