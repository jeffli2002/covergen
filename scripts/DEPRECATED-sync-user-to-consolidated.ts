#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const userId = '57c1c563-4cdd-4471-baa0-f49064b997c9'
  
  console.log('Syncing user to subscriptions_consolidated...')
  
  // Get data from bestauth_subscriptions
  const { data: source } = await supabase
    .from('bestauth_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (!source) {
    console.error('Source not found')
    return
  }
  
  console.log('Source:', { tier: source.tier, points: source.points_balance })
  
  // Insert/update to consolidated
  const { data, error } = await supabase
    .from('subscriptions_consolidated')
    .upsert({
      user_id: source.user_id,
      tier: source.tier,
      status: source.status,
      stripe_subscription_id: source.stripe_subscription_id,
      stripe_customer_id: source.stripe_customer_id,
      current_period_start: source.current_period_start,
      current_period_end: source.current_period_end,
      cancel_at_period_end: source.cancel_at_period_end || false,
      billing_cycle: source.billing_cycle,
      previous_tier: source.previous_tier,
      points_balance: source.points_balance,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })
    .select()
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('✅ Synced!', data?.[0] ? { tier: data[0].tier, points: data[0].points_balance } : 'no data')
  }
}

main().catch(console.error)
