import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkGenerationLimit } from '@/lib/generation-limits'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Get generation limit status
    const limitStatus = await checkGenerationLimit(user?.id || null)
    
    if (!limitStatus) {
      // Return default free tier limits if check fails
      return NextResponse.json({
        daily_usage: 0,
        daily_limit: 3,
        remaining_daily: 3,
        is_trial: false,
        subscription_tier: 'free'
      })
    }
    
    // Return simplified status for header display
    return NextResponse.json({
      daily_usage: limitStatus.daily_usage,
      daily_limit: limitStatus.daily_limit || 
        (limitStatus.is_trial 
          ? limitStatus.trial_limit || 0 
          : limitStatus.monthly_limit || 0),
      remaining_daily: limitStatus.remaining_daily,
      is_trial: limitStatus.is_trial,
      subscription_tier: limitStatus.subscription_tier,
      trial_ends_at: limitStatus.trial_ends_at
    })
    
  } catch (error) {
    console.error('[Usage Status] Error:', error)
    // Return default free tier on error
    return NextResponse.json({
      daily_usage: 0,
      daily_limit: 3,
      remaining_daily: 3,
      is_trial: false,
      subscription_tier: 'free'
    })
  }
}