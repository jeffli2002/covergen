import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
    }
    
    // Initialize Supabase admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    
    // Check in Supabase auth.users
    const { data: supabaseUser, error: supabaseError } = await supabase
      .rpc('get_user_by_email', { email })
      .single()
    
    // Check in bestauth_users
    const { data: bestAuthUser, error: bestAuthError } = await supabase
      .from('bestauth_users')
      .select('*')
      .eq('email', email)
      .single()
    
    // Check subscriptions
    const { data: supabaseSubscription } = await supabase
      .from('subscriptions_consolidated')
      .select('*')
      .eq('email', email)
      .single()
    
    const { data: bestAuthSubscription } = await supabase
      .from('bestauth_subscriptions')
      .select('*')
      .eq('user_id', bestAuthUser?.id || 'none')
      .single()
    
    // Check payment records
    const { data: creemCustomer } = await supabase
      .from('bestauth_subscriptions')
      .select('stripe_customer_id')
      .or(`stripe_customer_id.like.%${email}%,metadata->>'email'.eq.${email}`)
      .limit(5)
    
    return NextResponse.json({
      email,
      supabase: {
        hasUser: !!supabaseUser && !supabaseError,
        user: supabaseUser,
        error: supabaseError?.message
      },
      bestauth: {
        hasUser: !!bestAuthUser && !bestAuthError,
        user: bestAuthUser,
        error: bestAuthError?.message
      },
      subscriptions: {
        supabase: supabaseSubscription,
        bestauth: bestAuthSubscription
      },
      payment: {
        creemCustomers: creemCustomer
      },
      analysis: {
        isUsingSupabaseAuth: !!supabaseUser && !bestAuthUser,
        isUsingBestAuth: !!bestAuthUser,
        hasActiveSubscription: !!(supabaseSubscription || bestAuthSubscription),
        needsMigration: !!supabaseUser && !bestAuthUser
      }
    })
  } catch (error: any) {
    console.error('Debug check user error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check user' },
      { status: 500 }
    )
  }
}