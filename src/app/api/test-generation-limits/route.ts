import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkGenerationLimit, getUserSubscriptionInfo } from '@/lib/generation-limits'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({
        error: 'Not authenticated',
        userError: userError?.message
      }, { status: 401 })
    }

    console.log('[Test] Testing for user:', user.id, user.email)

    // Test 1: Get subscription info
    const subscriptionInfo = await getUserSubscriptionInfo(user.id)
    
    // Test 2: Check generation limits
    const limitStatus = await checkGenerationLimit(user.id)
    
    // Test 3: Check if tables exist
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
    
    const { data: usage, error: usageError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    // Test 4: Try to call the function to see if it exists
    let funcError = null
    try {
      await supabase.rpc('check_generation_limit', {
        p_user_id: user.id
      })
    } catch (error) {
      funcError = error
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      subscriptionInfo,
      limitStatus,
      databaseChecks: {
        subscriptions: {
          hasData: !!subscriptions,
          count: subscriptions?.length || 0,
          error: subError?.message,
          data: subscriptions
        },
        usage: {
          hasData: !!usage,
          count: usage?.length || 0,
          error: usageError?.message,
          data: usage
        },
        functions: {
          exists: !funcError,
          error: funcError instanceof Error ? funcError.message : funcError?.toString(),
          message: funcError ? 'Function not found or error calling it' : 'Function exists and is callable'
        }
      }
    })
  } catch (error) {
    console.error('[Test] Error:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}