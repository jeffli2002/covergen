// Script to delete test user 994235892@qq.com from BestAuth database
// Run with: node scripts/delete-test-user.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function deleteTestUser() {
  const email = '994235892@qq.com'
  console.log(`Starting deletion of test user: ${email}`)

  try {
    // First, find the user
    const { data: user, error: findError } = await supabase
      .from('bestauth_users')
      .select('id')
      .eq('email', email)
      .single()

    if (findError) {
      if (findError.code === 'PGRST116') {
        console.log('User not found in database')
        return
      }
      throw findError
    }

    if (!user) {
      console.log('User not found in database')
      return
    }

    console.log(`Found user with ID: ${user.id}`)

    // Delete related data in order
    const deletions = {
      sessions: 0,
      subscriptions: 0,
      usageTracking: 0,
      oauthAccounts: 0,
      magicLinks: 0,
      passwordResets: 0,
      verificationTokens: 0
    }

    // 1. Delete sessions
    const { data: deletedSessions, error: sessionsError } = await supabase
      .from('bestauth_sessions')
      .delete()
      .eq('user_id', user.id)
      .select('id')
    if (sessionsError) console.warn('Sessions deletion error:', sessionsError.message)
    deletions.sessions = deletedSessions?.length || 0

    // 2. Delete subscriptions
    const { data: deletedSubs, error: subsError } = await supabase
      .from('bestauth_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .select('id')
    if (subsError) console.warn('Subscriptions deletion error:', subsError.message)
    deletions.subscriptions = deletedSubs?.length || 0

    // 3. Delete usage tracking
    const { data: deletedUsage, error: usageError } = await supabase
      .from('bestauth_usage_tracking')
      .delete()
      .eq('user_id', user.id)
      .select('date')
    if (usageError) console.warn('Usage tracking deletion error:', usageError.message)
    deletions.usageTracking = deletedUsage?.length || 0

    // 4. Delete OAuth accounts
    const { data: deletedOauth, error: oauthError } = await supabase
      .from('bestauth_oauth_accounts')
      .delete()
      .eq('user_id', user.id)
      .select('id')
    if (oauthError) console.warn('OAuth accounts deletion error:', oauthError.message)
    deletions.oauthAccounts = deletedOauth?.length || 0

    // 5. Delete magic links
    const { data: deletedMagic, error: magicError } = await supabase
      .from('bestauth_magic_links')
      .delete()
      .eq('email', email)
      .select('email')
    if (magicError) console.warn('Magic links deletion error:', magicError.message)
    deletions.magicLinks = deletedMagic?.length || 0

    // 6. Delete password reset tokens
    const { data: deletedResets, error: resetsError } = await supabase
      .from('bestauth_password_resets')
      .delete()
      .eq('user_id', user.id)
      .select('id')
    if (resetsError) console.warn('Password resets deletion error:', resetsError.message)
    deletions.passwordResets = deletedResets?.length || 0

    // 7. Delete verification tokens
    const { data: deletedTokens, error: tokensError } = await supabase
      .from('bestauth_verification_tokens')
      .delete()
      .eq('email', email)
      .select('id')
    if (tokensError) console.warn('Verification tokens deletion error:', tokensError.message)
    deletions.verificationTokens = deletedTokens?.length || 0

    // 8. Finally, delete the user
    const { data: deletedUser, error: userDeleteError } = await supabase
      .from('bestauth_users')
      .delete()
      .eq('id', user.id)
      .select('id')
    
    if (userDeleteError) throw userDeleteError

    console.log('\n✅ Deletion complete!')
    console.log('Deleted records:', deletions)
    console.log('User deleted:', deletedUser?.length === 1 ? 'Yes' : 'No')

  } catch (error) {
    console.error('\n❌ Error deleting user:', error.message)
    process.exit(1)
  }
}

// Run the deletion
deleteTestUser()