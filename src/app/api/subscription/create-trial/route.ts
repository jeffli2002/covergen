import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { tier = 'pro', trialDays = 3 } = await req.json()
    
    // Check if subscription already exists
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .single()
    
    if (existingSub) {
      return NextResponse.json(
        { error: 'Subscription already exists' },
        { status: 400 }
      )
    }
    
    // Calculate trial end date
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + trialDays)
    
    // Create trial subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        tier: tier,
        status: 'trialing',
        current_period_start: new Date().toISOString(),
        current_period_end: trialEndDate.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (subError) {
      console.error('[CreateTrial] Error creating subscription:', subError)
      return NextResponse.json(
        { error: 'Failed to create trial subscription', details: subError.message },
        { status: 500 }
      )
    }
    
    // Also update the user's metadata in auth.users if needed
    await supabase.auth.updateUser({
      data: {
        subscription_tier: tier,
        trial_start: new Date().toISOString(),
        trial_end: trialEndDate.toISOString()
      }
    })
    
    return NextResponse.json({
      success: true,
      subscription,
      message: `${trialDays}-day ${tier} trial started successfully`
    })
    
  } catch (error) {
    console.error('[CreateTrial] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Failed to create trial', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}