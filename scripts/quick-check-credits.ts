#!/usr/bin/env npx tsx
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function checkCredits() {
  const email = '994235892@qq.com'
  
  // Get user
  const { data: user } = await supabase
    .from('bestauth_users')
    .select('id, email')
    .eq('email', email)
    .single()
  
  if (!user) {
    console.log('User not found')
    return
  }
  
  console.log(`User: ${user.email}`)
  console.log(`ID: ${user.id}\n`)
  
  // Get subscription
  const { data: sub } = await supabase
    .from('bestauth_subscriptions')
    .select('tier, status, points_balance, points_lifetime_earned, points_lifetime_spent')
    .eq('user_id', user.id)
    .single()
  
  console.log('=== BESTAUTH_SUBSCRIPTIONS ===')
  console.log('Tier:', sub?.tier)
  console.log('Status:', sub?.status)
  console.log('Points Balance:', sub?.points_balance)
  console.log('Lifetime Earned:', sub?.points_lifetime_earned)
  console.log('Lifetime Spent:', sub?.points_lifetime_spent)
  
  // Get mapping
  const { data: mapping } = await supabase
    .from('user_id_mapping')
    .select('supabase_user_id')
    .eq('bestauth_user_id', user.id)
    .maybeSingle()
  
  console.log('\n=== USER MAPPING ===')
  console.log('Supabase User ID:', mapping?.supabase_user_id || 'None')
  
  // Get points_balances if mapping exists
  if (mapping?.supabase_user_id) {
    const { data: points } = await supabase
      .from('points_balances')
      .select('balance, lifetime_earned, lifetime_spent')
      .eq('user_id', mapping.supabase_user_id)
      .maybeSingle()
    
    console.log('\n=== POINTS_BALANCES ===')
    console.log('Balance:', points?.balance ?? 'No record')
    console.log('Lifetime Earned:', points?.lifetime_earned ?? 'No record')
    console.log('Lifetime Spent:', points?.lifetime_spent ?? 'No record')
  }
}

checkCredits()
