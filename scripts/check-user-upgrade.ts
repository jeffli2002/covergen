#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const email = process.argv[2] || '994235892@qq.com'

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('='.repeat(80))
  console.log(`Checking ${email} upgrade status`)
  console.log('='.repeat(80))
  
  // Get user
  const { data: user } = await supabase
    .from('bestauth_users')
    .select('id, email')
    .eq('email', email)
    .single()
  
  if (!user) {
    console.log('❌ User not found')
    return
  }
  
  console.log('\n✅ User found:', user.email, '(', user.id, ')')
  
  // Check both subscription tables
  const { data: bestauth } = await supabase
    .from('bestauth_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  const { data: consolidated } = await supabase
    .from('subscriptions_consolidated')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  console.log('\n=== BESTAUTH_SUBSCRIPTIONS ===')
  console.log('Tier:', bestauth?.tier)
  console.log('Status:', bestauth?.status)
  console.log('Previous Tier:', bestauth?.previous_tier)
  console.log('Billing Cycle:', bestauth?.billing_cycle)
  console.log('Stripe Sub ID:', bestauth?.stripe_subscription_id)
  console.log('Updated:', bestauth?.updated_at)
  console.log('Points Balance:', bestauth?.points_balance)
  
  console.log('\n=== SUBSCRIPTIONS_CONSOLIDATED ===')
  console.log('Tier:', consolidated?.tier)
  console.log('Status:', consolidated?.status)
  console.log('Previous Tier:', consolidated?.previous_tier)
  console.log('Billing Cycle:', consolidated?.billing_cycle)
  console.log('Stripe Sub ID:', consolidated?.stripe_subscription_id)
  console.log('Updated:', consolidated?.updated_at)
  console.log('Points Balance:', consolidated?.points_balance)
  
  const inSync = bestauth?.tier === consolidated?.tier
  console.log('\n' + (inSync ? '✅ Tables in sync' : '❌ Tables OUT OF SYNC!'))
  
  if (bestauth?.tier === 'pro_plus') {
    console.log('\n✅ Upgrade successful - user is Pro+')
    console.log('Expected credits: 200/month (Pro+)')
    console.log('Actual points balance:', bestauth?.points_balance || consolidated?.points_balance || 0)
  } else if (bestauth?.tier === 'pro') {
    console.log('\n⚠️  User still on Pro tier')
    console.log('Expected credits: 100/month (Pro)')
    console.log('Actual points balance:', bestauth?.points_balance || consolidated?.points_balance || 0)
  }
}

main().catch(console.error)
