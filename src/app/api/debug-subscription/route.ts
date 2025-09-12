import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    console.log('[Debug Subscription] Checking for user:', user.email, user.id)
    
    // Check subscriptions table
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
    
    // Check auth.users table for legacy trial data
    const { data: authUserData, error: authError } = await supabase
      .from('auth.users')
      .select('creem_trial_ends_at, creem_subscription_tier')
      .eq('id', user.id)
      .single()
    
    // Check profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      subscriptions: {
        data: subscriptions,
        error: subError?.message,
        count: subscriptions?.length || 0
      },
      authUser: {
        data: authUserData,
        error: authError?.message
      },
      profile: {
        data: profile,
        error: profileError?.message
      }
    })
    
  } catch (error) {
    console.error('[Debug Subscription] Error:', error)
    return NextResponse.json(
      { error: 'Failed to debug subscription' },
      { status: 500 }
    )
  }
}