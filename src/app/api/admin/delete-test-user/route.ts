// Admin API to delete test user
// WARNING: This should be removed in production
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/bestauth/db'

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
    
    // 1. Delete sessions
    const sessionsResult = await db.pool.query(
      'DELETE FROM bestauth_sessions WHERE user_id = $1',
      [user.id]
    )
    deletions.sessions = sessionsResult.rowCount || 0
    
    // 2. Delete subscriptions
    const subscriptionsResult = await db.pool.query(
      'DELETE FROM bestauth_subscriptions WHERE user_id = $1',
      [user.id]
    )
    deletions.subscriptions = subscriptionsResult.rowCount || 0
    
    // 3. Delete usage tracking
    const usageResult = await db.pool.query(
      'DELETE FROM bestauth_usage_tracking WHERE user_id = $1',
      [user.id]
    )
    deletions.usageTracking = usageResult.rowCount || 0
    
    // 4. Delete OAuth accounts
    const oauthResult = await db.pool.query(
      'DELETE FROM bestauth_oauth_accounts WHERE user_id = $1',
      [user.id]
    )
    deletions.oauthAccounts = oauthResult.rowCount || 0
    
    // 5. Delete magic links
    const magicLinksResult = await db.pool.query(
      'DELETE FROM bestauth_magic_links WHERE email = $1',
      [email]
    )
    deletions.magicLinks = magicLinksResult.rowCount || 0
    
    // 6. Delete password reset tokens
    const passwordResetsResult = await db.pool.query(
      'DELETE FROM bestauth_password_reset_tokens WHERE user_id = $1',
      [user.id]
    )
    deletions.passwordResets = passwordResetsResult.rowCount || 0
    
    // 7. Finally, delete the user
    const userResult = await db.pool.query(
      'DELETE FROM bestauth_users WHERE id = $1',
      [user.id]
    )
    
    console.log(`[Admin] Deletion complete:`, deletions)
    
    return NextResponse.json({
      success: true,
      message: `Successfully deleted user: ${email}`,
      userId: user.id,
      deletions,
      userDeleted: userResult.rowCount === 1
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