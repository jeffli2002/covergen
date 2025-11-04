#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

async function manuallyVerifyEmail() {
  const email = process.argv[2]
  
  if (!email) {
    console.log('❌ Please provide an email address')
    console.log('Usage: npx tsx scripts/manually-verify-email.ts <email>')
    return
  }

  console.log('🔧 Manually Verifying Email')
  console.log('=' .repeat(70))
  console.log('')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Find user
    console.log(`📋 Looking for user: ${email}`)
    const { data: user, error: findError } = await supabase
      .from('bestauth_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (findError || !user) {
      console.log('   ❌ User not found')
      return
    }

    console.log(`   ✅ User found: ${user.id}`)
    console.log(`   📧 Current status: ${user.email_verified ? 'Verified' : 'Not verified'}`)
    console.log('')

    if (user.email_verified) {
      console.log('✅ Email is already verified!')
      return
    }

    // Update user to verified
    console.log('📝 Updating email verification status...')
    const { error: updateError } = await supabase
      .from('bestauth_users')
      .update({ email_verified: true })
      .eq('id', user.id)

    if (updateError) {
      console.log('   ❌ Failed to update:', updateError.message)
      return
    }

    console.log('   ✅ Email verified successfully!')
    console.log('')

    // Log activity
    console.log('📝 Recording activity...')
    const { error: logError } = await supabase
      .from('bestauth_activity_logs')
      .insert({
        user_id: user.id,
        action: 'email_verified',
        metadata: { email: user.email, method: 'manual' }
      })

    if (!logError) {
      console.log('   ✅ Activity logged')
    }

    console.log('')
    console.log('=' .repeat(70))
    console.log('🎉 Email verification completed!')
    console.log('=' .repeat(70))
    console.log('')
    console.log(`✅ ${email} is now verified`)
    console.log('')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

manuallyVerifyEmail()

