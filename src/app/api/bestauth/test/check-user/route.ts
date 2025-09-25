// Test endpoint to check if user exists in BestAuth tables
import { NextRequest, NextResponse } from 'next/server'
import { validateSessionFromRequest } from '@/lib/bestauth'
import { db } from '@/lib/bestauth/db-wrapper'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Validate session
    const session = await validateSessionFromRequest(request)
    
    if (!session.success || !session.data) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = session.data.user.id
    const userEmail = session.data.user.email
    
    // Check if user exists in bestauth_users
    const user = await db.users.findById(userId)
    
    // Check if subscription exists
    const subscription = await db.subscriptions.findByUserId(userId)
    
    // Direct database check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    
    // Check bestauth_users table
    const { data: userData, error: userError } = await supabase
      .from('bestauth_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    
    // Check bestauth_subscriptions table
    const { data: subData, error: subError } = await supabase
      .from('bestauth_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    
    // Check if email exists
    const { data: emailData, error: emailError } = await supabase
      .from('bestauth_users')
      .select('*')
      .eq('email', userEmail)
      .maybeSingle()
    
    return NextResponse.json({
      session: {
        userId,
        userEmail
      },
      userCheck: {
        existsInDb: !!user,
        user,
        directUserData: userData,
        userError
      },
      subscriptionCheck: {
        existsInDb: !!subscription,
        subscription,
        directSubData: subData,
        subError
      },
      emailCheck: {
        emailData,
        emailError
      },
      analysis: {
        userMissing: !user && !userData,
        subscriptionMissing: !subscription && !subData,
        needsUserCreation: !userData && !!emailData,
        needsSubscriptionCreation: !!userData && !subData
      }
    })
  } catch (error: any) {
    console.error('Check user error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check user',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}