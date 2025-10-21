#!/usr/bin/env npx tsx
/**
 * Check free users with billing_cycle set
 * This indicates they were previously paid users who downgraded
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkFreeUsersBilling() {
  console.log('=== Checking Free Users with Billing Cycle ===\n')
  
  // Get all free users
  const { data: freeUsers, error } = await supabase
    .from('bestauth_subscriptions')
    .select(`
      user_id,
      tier,
      billing_cycle,
      previous_tier,
      stripe_subscription_id,
      status,
      updated_at,
      metadata
    `)
    .eq('tier', 'free')
    .order('updated_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching users:', error)
    return
  }
  
  console.log(`Total Free users: ${freeUsers.length}\n`)
  
  // Get user emails
  const userIds = freeUsers.map(u => u.user_id)
  const { data: users } = await supabase
    .from('bestauth_users')
    .select('id, email')
    .in('id', userIds)
  
  const emailMap = new Map(users?.map(u => [u.id, u.email]) || [])
  
  // Categorize users
  const withBillingCycle = freeUsers.filter(u => u.billing_cycle !== null)
  const withoutBillingCycle = freeUsers.filter(u => u.billing_cycle === null)
  
  console.log(`Free users WITH billing_cycle: ${withBillingCycle.length}`)
  console.log(`Free users WITHOUT billing_cycle: ${withoutBillingCycle.length}\n`)
  
  console.log('=== Free Users with Billing Cycle (Former Paid Users) ===\n')
  withBillingCycle.forEach(user => {
    const email = emailMap.get(user.user_id) || 'Unknown'
    console.log(`Email: ${email}`)
    console.log(`  User ID: ${user.user_id}`)
    console.log(`  Billing Cycle: ${user.billing_cycle}`)
    console.log(`  Previous Tier: ${user.previous_tier || 'None'}`)
    console.log(`  Stripe Sub ID: ${user.stripe_subscription_id || 'None'}`)
    console.log(`  Status: ${user.status}`)
    console.log(`  Last Updated: ${user.updated_at}`)
    
    // Determine how they became free
    if (user.previous_tier) {
      console.log(`  → Was ${user.previous_tier}, downgraded to free`)
    } else if (user.stripe_subscription_id) {
      console.log(`  → Had Stripe subscription but now free (cancelled?)`)
    } else {
      console.log(`  → Unknown reason for billing_cycle`)
    }
    
    console.log('')
  })
  
  console.log('\n=== Recommendation ===')
  console.log('Free users should have billing_cycle = null')
  console.log('Users with billing_cycle are likely former paid subscribers who:')
  console.log('  1. Cancelled their subscription')
  console.log('  2. Were downgraded after failed payment')
  console.log('  3. Trial expired without payment')
  console.log('\nThe billing_cycle field should be cleared when downgrading to free.')
}

checkFreeUsersBilling().catch(console.error)
