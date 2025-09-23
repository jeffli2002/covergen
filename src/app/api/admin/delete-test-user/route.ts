// Admin API to delete test user
// WARNING: This should be removed in production
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/bestauth/db'
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client'

export async function DELETE(request: NextRequest) {
  try {
    // Get email from query params
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    // Only allow deletion of specific test emails
    const allowedTestEmails = ['994235892@qq.com']
    
    if (!email || !allowedTestEmails.includes(email)) {
      return NextResponse.json(
        { error: 'Invalid or protected email' },
        { status: 400 }
      )
    }
    
    console.log(`[Admin] Deleting test user: ${email}`)
    
    // First, find the user
    const user = await db.users.findByEmail(email)
    
    if (!user) {
      return NextResponse.json({
        message: 'User not found',
        email
      })
    }
    
    console.log(`[Admin] Found user with ID: ${user.id}`)
    
    // Delete related data in order (to avoid foreign key constraints)
    const deletions = {
      sessions: 0,
      subscriptions: 0,
      usageTracking: 0,
      oauthAccounts: 0,
      magicLinks: 0,
      passwordResets: 0
    }
    
    // Prepare DB client (service role)
    const client = getBestAuthSupabaseClient()
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    // 1. Delete sessions
    const { data: deletedSessions, error: sessionsError } = await client
      .from('bestauth_sessions')
      .delete()
      .eq('user_id', user.id)
      .select('id')
    if (sessionsError) throw sessionsError
    deletions.sessions = deletedSessions?.length || 0
    
    // 2. Delete subscriptions
    const { data: deletedSubs, error: subsError } = await client
      .from('bestauth_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .select('id')
    if (subsError) throw subsError
    deletions.subscriptions = deletedSubs?.length || 0
    
    // 3. Delete usage tracking
    const { data: deletedUsage, error: usageError } = await client
      .from('bestauth_usage_tracking')
      .delete()
      .eq('user_id', user.id)
      .select('date')
    if (usageError) throw usageError
    deletions.usageTracking = deletedUsage?.length || 0
    
    // 4. Delete OAuth accounts
    const { data: deletedOauth, error: oauthError } = await client
      .from('bestauth_oauth_accounts')
      .delete()
      .eq('user_id', user.id)
      .select('id')
    if (oauthError) throw oauthError
    deletions.oauthAccounts = deletedOauth?.length || 0
    
    // 5. Delete magic links
    const { data: deletedMagic, error: magicError } = await client
      .from('bestauth_magic_links')
      .delete()
      .eq('email', email)
      .select('email')
    if (magicError) throw magicError
    deletions.magicLinks = deletedMagic?.length || 0
    
    // 6. Delete password reset tokens
    const { data: deletedResets, error: resetsError } = await client
      .from('bestauth_password_resets')
      .delete()
      .eq('user_id', user.id)
      .select('id')
    if (resetsError) throw resetsError
    deletions.passwordResets = deletedResets?.length || 0
    
    // 7. Finally, delete the user
    const { data: deletedUsers, error: userDeleteError } = await client
      .from('bestauth_users')
      .delete()
      .eq('id', user.id)
      .select('id')
    if (userDeleteError) throw userDeleteError
    
    console.log(`[Admin] Deletion complete:`, deletions)
    
    return NextResponse.json({
      success: true,
      message: `Successfully deleted user: ${email}`,
      userId: user.id,
      deletions,
      userDeleted: (deletedUsers?.length || 0) === 1
    })
    
  } catch (error) {
    console.error('[Admin] Error deleting user:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}