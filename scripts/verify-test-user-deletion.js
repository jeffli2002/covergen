// Script to verify test user 994235892@qq.com has been deleted from all tables
// Run with: node scripts/verify-test-user-deletion.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyDeletion() {
  const email = '994235892@qq.com'
  const userId = '200fb694-3c84-4775-a5a5-ef0dc2e72bbb' // From previous deletion
  
  console.log(`Verifying deletion of test user: ${email}`)
  console.log(`User ID: ${userId}`)
  console.log('=' * 60)
  
  const checks = []
  
  // 1. Check bestauth_users
  console.log('\n1. Checking bestauth_users...')
  const { data: users, error: usersError } = await supabase
    .from('bestauth_users')
    .select('*')
    .or(`email.eq.${email},id.eq.${userId}`)
  
  if (usersError && usersError.code !== 'PGRST116') {
    console.error('Error checking users:', usersError.message)
  } else {
    console.log(`Found users: ${users?.length || 0}`)
    if (users?.length) console.log('USER STILL EXISTS!', users)
    checks.push({ table: 'bestauth_users', found: users?.length || 0 })
  }
  
  // 2. Check bestauth_sessions
  console.log('\n2. Checking bestauth_sessions...')
  const { data: sessions, error: sessionsError } = await supabase
    .from('bestauth_sessions')
    .select('*')
    .eq('user_id', userId)
  
  if (sessionsError && sessionsError.code !== 'PGRST116') {
    console.error('Error checking sessions:', sessionsError.message)
  } else {
    console.log(`Found sessions: ${sessions?.length || 0}`)
    if (sessions?.length) console.log('SESSIONS STILL EXIST!', sessions)
    checks.push({ table: 'bestauth_sessions', found: sessions?.length || 0 })
  }
  
  // 3. Check bestauth_subscriptions
  console.log('\n3. Checking bestauth_subscriptions...')
  const { data: subscriptions, error: subsError } = await supabase
    .from('bestauth_subscriptions')
    .select('*')
    .eq('user_id', userId)
  
  if (subsError && subsError.code !== 'PGRST116') {
    console.error('Error checking subscriptions:', subsError.message)
  } else {
    console.log(`Found subscriptions: ${subscriptions?.length || 0}`)
    if (subscriptions?.length) console.log('SUBSCRIPTIONS STILL EXIST!', subscriptions)
    checks.push({ table: 'bestauth_subscriptions', found: subscriptions?.length || 0 })
  }
  
  // 4. Check bestauth_usage_tracking
  console.log('\n4. Checking bestauth_usage_tracking...')
  const { data: usage, error: usageError } = await supabase
    .from('bestauth_usage_tracking')
    .select('*')
    .eq('user_id', userId)
  
  if (usageError && usageError.code !== 'PGRST116') {
    console.error('Error checking usage:', usageError.message)
  } else {
    console.log(`Found usage records: ${usage?.length || 0}`)
    if (usage?.length) console.log('USAGE RECORDS STILL EXIST!', usage)
    checks.push({ table: 'bestauth_usage_tracking', found: usage?.length || 0 })
  }
  
  // 5. Check bestauth_oauth_accounts
  console.log('\n5. Checking bestauth_oauth_accounts...')
  const { data: oauth, error: oauthError } = await supabase
    .from('bestauth_oauth_accounts')
    .select('*')
    .eq('user_id', userId)
  
  if (oauthError && oauthError.code !== 'PGRST116') {
    console.error('Error checking oauth:', oauthError.message)
  } else {
    console.log(`Found OAuth accounts: ${oauth?.length || 0}`)
    if (oauth?.length) console.log('OAUTH ACCOUNTS STILL EXIST!', oauth)
    checks.push({ table: 'bestauth_oauth_accounts', found: oauth?.length || 0 })
  }
  
  // 6. Check bestauth_magic_links
  console.log('\n6. Checking bestauth_magic_links...')
  const { data: magicLinks, error: magicError } = await supabase
    .from('bestauth_magic_links')
    .select('*')
    .eq('email', email)
  
  if (magicError && magicError.code !== 'PGRST116') {
    console.error('Error checking magic links:', magicError.message)
  } else {
    console.log(`Found magic links: ${magicLinks?.length || 0}`)
    if (magicLinks?.length) console.log('MAGIC LINKS STILL EXIST!', magicLinks)
    checks.push({ table: 'bestauth_magic_links', found: magicLinks?.length || 0 })
  }
  
  // 7. Check bestauth_password_resets
  console.log('\n7. Checking bestauth_password_resets...')
  const { data: passwordResets, error: resetsError } = await supabase
    .from('bestauth_password_resets')
    .select('*')
    .eq('user_id', userId)
  
  if (resetsError && resetsError.code !== 'PGRST116') {
    console.error('Error checking password resets:', resetsError.message)
  } else {
    console.log(`Found password resets: ${passwordResets?.length || 0}`)
    if (passwordResets?.length) console.log('PASSWORD RESETS STILL EXIST!', passwordResets)
    checks.push({ table: 'bestauth_password_resets', found: passwordResets?.length || 0 })
  }
  
  // 8. Check auth.users (Supabase auth)
  console.log('\n8. Checking auth.users (Supabase)...')
  const { data: authUsers, error: authError } = await supabase
    .from('auth.users')
    .select('*')
    .eq('email', email)
  
  if (authError && authError.code !== 'PGRST116') {
    console.error('Error checking auth.users:', authError.message)
  } else {
    console.log(`Found Supabase auth users: ${authUsers?.length || 0}`)
    if (authUsers?.length) console.log('SUPABASE AUTH USER STILL EXISTS!', authUsers)
    checks.push({ table: 'auth.users', found: authUsers?.length || 0 })
  }
  
  // 9. Check public.users (if exists)
  console.log('\n9. Checking public.users...')
  const { data: publicUsers, error: publicError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
  
  if (publicError && publicError.code !== 'PGRST116') {
    if (publicError.code === '42P01') {
      console.log('Table public.users does not exist')
    } else {
      console.error('Error checking public.users:', publicError.message)
    }
  } else {
    console.log(`Found public users: ${publicUsers?.length || 0}`)
    if (publicUsers?.length) console.log('PUBLIC USER STILL EXISTS!', publicUsers)
    checks.push({ table: 'public.users', found: publicUsers?.length || 0 })
  }
  
  // 10. Check subscriptions (if exists)
  console.log('\n10. Checking subscriptions...')
  const { data: subs, error: subsTableError } = await supabase
    .from('subscriptions')
    .select('*')
    .or(`user_id.eq.${userId},stripe_customer_email.eq.${email}`)
  
  if (subsTableError && subsTableError.code !== 'PGRST116') {
    if (subsTableError.code === '42P01') {
      console.log('Table subscriptions does not exist')
    } else {
      console.error('Error checking subscriptions:', subsTableError.message)
    }
  } else {
    console.log(`Found subscriptions: ${subs?.length || 0}`)
    if (subs?.length) console.log('SUBSCRIPTIONS STILL EXIST!', subs)
    checks.push({ table: 'subscriptions', found: subs?.length || 0 })
  }
  
  // Summary
  console.log('\n' + '=' * 60)
  console.log('VERIFICATION SUMMARY:')
  console.log('=' * 60)
  
  const totalFound = checks.reduce((sum, check) => sum + check.found, 0)
  
  if (totalFound === 0) {
    console.log('✅ SUCCESS: Test user has been completely deleted from all tables!')
  } else {
    console.log('❌ WARNING: Test user data still exists in the following tables:')
    checks.forEach(check => {
      if (check.found > 0) {
        console.log(`   - ${check.table}: ${check.found} record(s)`)
      }
    })
  }
  
  console.log('\nChecked tables:')
  checks.forEach(check => {
    console.log(`   - ${check.table}: ${check.found === 0 ? '✅ Clean' : `❌ ${check.found} record(s)`}`)
  })
}

// Run the verification
verifyDeletion().catch(console.error)