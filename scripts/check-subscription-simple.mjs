#!/usr/bin/env node

/**
 * Simple script to check subscription tier in database
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load env vars
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const email = process.argv[2] || '994235892@qq.com'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log(`\n🔍 Checking subscription for: ${email}\n`)

// 1. Find user
const { data: user, error: userError } = await supabase
  .from('bestauth_users')
  .select('id, email, name')
  .eq('email', email)
  .single()

if (userError || !user) {
  console.error('❌ User not found:', userError?.message)
  process.exit(1)
}

console.log('✅ User found:', user.id)

// 2. Get subscription
const { data: subscription, error: subError } = await supabase
  .from('bestauth_subscriptions')
  .select('*')
  .eq('user_id', user.id)
  .single()

if (subError) {
  console.error('❌ Subscription error:', subError.message)
  process.exit(1)
}

console.log('\n✅ Current subscription state:')
console.log('   Tier:', subscription.tier)
console.log('   Status:', subscription.status)
console.log('   Billing Cycle:', subscription.billing_cycle)
console.log('   Previous Tier:', subscription.previous_tier)
console.log('   Updated At:', subscription.updated_at)

if (subscription.upgrade_history) {
  console.log('\n📈 Upgrade History:')
  subscription.upgrade_history.forEach((h, i) => {
    console.log(`   ${i + 1}. ${h.from_tier} → ${h.to_tier} at ${h.upgraded_at}`)
  })
}

if (subscription.metadata) {
  console.log('\n📝 Metadata:')
  console.log(JSON.stringify(subscription.metadata, null, 2))
}

console.log('\n')
