#!/usr/bin/env node

/**
 * Check user subscription in database
 * Usage: node scripts/check-user-subscription.mjs <email>
 */

import { createClient } from '@supabase/supabase-js'

const email = process.argv[2] || '994235892@qq.com'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSubscription() {
  console.log(`\n🔍 Checking subscription for: ${email}\n`)
  
  // 1. Find user
  const { data: user, error: userError } = await supabase
    .from('bestauth_users')
    .select('id, email, name, created_at')
    .eq('email', email)
    .single()
  
  if (userError || !user) {
    console.error('❌ User not found:', userError?.message)
    process.exit(1)
  }
  
  console.log('✅ User found:')
  console.log('   ID:', user.id)
  console.log('   Email:', user.email)
  console.log('   Name:', user.name)
  console.log('   Created:', user.created_at)
  
  // 2. Get subscription
  const { data: subscription, error: subError } = await supabase
    .from('bestauth_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  if (subError) {
    console.error('\n❌ Subscription query error:', subError.message)
    if (subError.code === 'PGRST116') {
      console.log('   No subscription record found for this user')
    }
  } else if (!subscription) {
    console.log('\n⚠️  No subscription found')
  } else {
    console.log('\n✅ Subscription found:')
    console.log('   ID:', subscription.id)
    console.log('   Tier:', subscription.tier)
    console.log('   Status:', subscription.status)
    console.log('   Billing Cycle:', subscription.billing_cycle)
    console.log('   Previous Tier:', subscription.previous_tier)
    console.log('   Stripe Customer ID:', subscription.stripe_customer_id)
    console.log('   Stripe Subscription ID:', subscription.stripe_subscription_id)
    console.log('   Stripe Price ID:', subscription.stripe_price_id)
    console.log('   Trial Ends At:', subscription.trial_ends_at)
    console.log('   Current Period Start:', subscription.current_period_start)
    console.log('   Current Period End:', subscription.current_period_end)
    console.log('   Cancel At Period End:', subscription.cancel_at_period_end)
    console.log('   Cancelled At:', subscription.cancelled_at)
    console.log('   Created:', subscription.created_at)
    console.log('   Updated:', subscription.updated_at)
    
    if (subscription.metadata) {
      console.log('   Metadata:', JSON.stringify(subscription.metadata, null, 2))
    }
    
    if (subscription.upgrade_history && subscription.upgrade_history.length > 0) {
      console.log('\n📈 Upgrade History:')
      subscription.upgrade_history.forEach((upgrade, i) => {
        console.log(`   ${i + 1}. ${upgrade.from_tier} → ${upgrade.to_tier} (${upgrade.upgraded_at})`)
      })
    }
  }
  
  // 3. Get points balance
  const { data: points, error: pointsError } = await supabase
    .from('points_balance')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  if (!pointsError && points) {
    console.log('\n💎 Points Balance:')
    console.log('   Balance:', points.balance)
    console.log('   Lifetime Earned:', points.lifetime_earned)
    console.log('   Lifetime Spent:', points.lifetime_spent)
    console.log('   Updated:', points.updated_at)
  }
  
  // 4. Get recent usage
  const { data: usage, error: usageError } = await supabase
    .from('bestauth_usage_tracking')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(7)
  
  if (!usageError && usage && usage.length > 0) {
    console.log('\n📊 Recent Usage (last 7 days):')
    usage.forEach(u => {
      console.log(`   ${u.date}: ${u.image_count || 0} images, ${u.video_count || 0} videos (total: ${u.generation_count || 0})`)
    })
  }
  
  console.log('\n')
}

checkSubscription().catch(console.error)
