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

  const { data: transactions } = await supabase
    .from('bestauth_points_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  console.log(`\n=== Transaction History for ${email} ===`)
  console.log('Total transactions:', transactions?.length || 0)
  
  if (transactions && transactions.length > 0) {
    console.log('\nRecent transactions:')
    transactions.forEach((tx, i) => {
      console.log(`${i + 1}. ${tx.amount > 0 ? '+' : ''}${tx.amount} credits | ${tx.description} | Balance: ${tx.balance_after}`)
      console.log(`   ${new Date(tx.created_at).toLocaleString()}`)
    })
  } else {
    console.log('\nNo transactions yet. After next image generation, transaction will be recorded.')
  }
}

check()
