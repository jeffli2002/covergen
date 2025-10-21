#!/usr/bin/env npx tsx
/**
 * Manually grant 800 Pro credits to user who upgraded
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const email = '994235892@qq.com'
const creditsToGrant = 800 // Pro monthly allocation

async function grantCredits() {
  console.log(`=== Granting ${creditsToGrant} Pro credits to ${email} ===\n`)
  
  // Get user
  const { data: user } = await supabase
    .from('bestauth_users')
    .select('id')
    .eq('email', email)
    .single()
  
  if (!user) {
    console.error('User not found')
    return
  }
  
  console.log(`User ID: ${user.id}`)
  
  // Get current subscription
  const { data: sub } = await supabase
    .from('bestauth_subscriptions')
    .select('tier, points_balance, points_lifetime_earned, points_lifetime_spent')
    .eq('user_id', user.id)
    .single()
  
  if (!sub) {
    console.error('Subscription not found')
    return
  }
  
  console.log('\n=== Current State ===')
  console.log('Tier:', sub.tier)
  console.log('Points Balance:', sub.points_balance)
  console.log('Lifetime Earned:', sub.points_lifetime_earned)
  console.log('Lifetime Spent:', sub.points_lifetime_spent)
  
  const newBalance = (sub.points_balance ?? 0) + creditsToGrant
  const newLifetimeEarned = (sub.points_lifetime_earned ?? 0) + creditsToGrant
  
  console.log('\n=== Granting Credits ===')
  console.log(`Adding ${creditsToGrant} credits...`)
  console.log(`New Balance: ${newBalance}`)
  console.log(`New Lifetime Earned: ${newLifetimeEarned}`)
  
  // Update subscription
  const { error } = await supabase
    .from('bestauth_subscriptions')
    .update({
      points_balance: newBalance,
      points_lifetime_earned: newLifetimeEarned,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)
  
  if (error) {
    console.error('\n❌ Failed to grant credits:', error)
    return
  }
  
  // Verify
  const { data: updated } = await supabase
    .from('bestauth_subscriptions')
    .select('points_balance, points_lifetime_earned')
    .eq('user_id', user.id)
    .single()
  
  console.log('\n=== Final State ===')
  console.log('Points Balance:', updated?.points_balance)
  console.log('Lifetime Earned:', updated?.points_lifetime_earned)
  
  if (updated?.points_balance === newBalance) {
    console.log('\n✅ Successfully granted credits!')
  } else {
    console.log('\n❌ Credit grant verification failed')
  }
}

grantCredits()
