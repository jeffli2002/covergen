#!/usr/bin/env npx tsx
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const email = process.argv[2] || '994235892@qq.com'

async function check() {
  const { data: user } = await supabase
    .from('bestauth_users')
    .select('id')
    .eq('email', email)
    .single()

  if (!user) {
    console.log('User not found:', email)
    return
  }

  const { data: sub } = await supabase
    .from('bestauth_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  console.log('\n=== User Credits Status ===')
  console.log('Email:', email)
  console.log('User ID:', user.id)
  console.log('Tier:', sub?.tier)
  console.log('Status:', sub?.status)
  console.log('Billing Cycle:', sub?.billing_cycle)
  console.log('\n=== Credits ===')
  console.log('Balance:', sub?.points_balance)
  console.log('Lifetime Earned:', sub?.points_lifetime_earned)
  console.log('Lifetime Spent:', sub?.points_lifetime_spent)
  console.log('')
}

check()
