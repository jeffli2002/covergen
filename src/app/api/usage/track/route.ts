import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getClientIP, getCurrentMonthKey } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    const { anonymous_id, platform } = await request.json()
    
    // Get user session if authenticated
    const { data: { user } } = await supabase.auth.getUser()
    const clientIP = getClientIP(request)
    const monthKey = getCurrentMonthKey()
    
    if (user) {
      // Track authenticated user usage
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .single()
        
      const tier = subscription?.tier || 'free'
      
      // Increment user usage
      const { data: usageData, error: usageError } = await supabase
        .rpc('increment_user_usage', {
          p_user_id: user.id,
          p_month_key: monthKey,
          p_subscription_tier: tier
        })
        
      if (usageError) throw usageError
      
      // Log the generation attempt
      await supabase
        .from('generation_logs')
        .insert({
          user_id: user.id,
          platform,
          status: 'success',
          ip_address: clientIP,
          user_agent: request.headers.get('user-agent')
        })
      
      return NextResponse.json({
        success: true,
        usage_count: usageData,
        tier,
        user_id: user.id
      })
      
    } else if (anonymous_id) {
      // Track anonymous usage
      const { data: usageData, error: usageError } = await supabase
        .rpc('increment_anonymous_usage', {
          p_anonymous_id: anonymous_id,
          p_month_key: monthKey
        })
        
      if (usageError) throw usageError
      
      // Log the generation attempt
      await supabase
        .from('generation_logs')
        .insert({
          anonymous_id,
          platform,
          status: 'success',
          ip_address: clientIP,
          user_agent: request.headers.get('user-agent')
        })
      
      return NextResponse.json({
        success: true,
        usage_count: usageData,
        anonymous: true
      })
      
    } else {
      return NextResponse.json(
        { error: 'No user session or anonymous ID provided' },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('Error tracking usage:', error)
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    const { searchParams } = new URL(request.url)
    const anonymous_id = searchParams.get('anonymous_id')
    const monthKey = getCurrentMonthKey()
    
    // Get user session if authenticated
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Get authenticated user usage
      const { data: usageData } = await supabase
        .rpc('get_user_usage', {
          p_user_id: user.id,
          p_month_key: monthKey
        })
        
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .single()
        
      const tier = subscription?.tier || 'free'
      const quotaLimits = {
        free: 10,
        pro: 120,
        pro_plus: 300
      }
      
      return NextResponse.json({
        usage_count: usageData || 0,
        quota_limit: quotaLimits[tier as keyof typeof quotaLimits] || 10,
        tier,
        user_id: user.id
      })
      
    } else if (anonymous_id) {
      // Get anonymous usage
      const { data: usageData } = await supabase
        .rpc('get_anonymous_usage', {
          p_anonymous_id: anonymous_id,
          p_month_key: monthKey
        })
      
      return NextResponse.json({
        usage_count: usageData || 0,
        quota_limit: 10,
        anonymous: true
      })
      
    } else {
      return NextResponse.json(
        { error: 'No user session or anonymous ID provided' },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('Error getting usage:', error)
    return NextResponse.json(
      { error: 'Failed to get usage' },
      { status: 500 }
    )
  }
}