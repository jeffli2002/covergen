#!/usr/bin/env npx tsx
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function check() {
  const email = 'jefflee2002@gmail.com'
  
  const { data: user } = await supabase
    .from('bestauth_users')
    .select('id, email')
    .eq('email', email)
    .single()
  
  if (!user) {
    console.log('User not found')
    return
  }
  
  console.log('User:', user.email, 'ID:', user.id)
  
  const { data: sub } = await supabase
    .from('bestauth_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  console.log('\nSubscription:')
  console.log('  Tier:', sub.tier)
  console.log('  Balance:', sub.points_balance)
  console.log('  Lifetime Earned:', sub.points_lifetime_earned)
  console.log('  Lifetime Spent:', sub.points_lifetime_spent)
  
  const { data: txs } = await supabase
    .from('bestauth_points_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  console.log('\nTransactions:')
  txs?.forEach((tx, i) => {
    console.log(`${i+1}. ${tx.amount > 0 ? '+' : ''}${tx.amount} | ${tx.description} | Balance: ${tx.balance_after}`)
    console.log(`   Type: ${tx.transaction_type} | ${new Date(tx.created_at).toLocaleString()}`)
  })
}

check()
