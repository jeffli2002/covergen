#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

async function checkTokens() {
  console.log('🔍 Checking Verification Tokens in Database')
  console.log('=' .repeat(70))
  console.log('')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Check if table exists
    const { data: tokens, error } = await supabase
      .from('bestauth_verification_tokens')
      .select('*')
      .limit(10)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching tokens:', error)
      console.log('')
      console.log('⚠️  This usually means:')
      console.log('1. The table "bestauth_verification_tokens" does not exist')
      console.log('2. You need to run the SQL in Supabase SQL Editor')
      console.log('')
      console.log('📝 See: EMAIL_VERIFICATION_FIX.md for SQL to run')
      return
    }

    if (!tokens || tokens.length === 0) {
      console.log('📭 No tokens found in database')
      console.log('')
      console.log('✅ Table exists but is empty (this is normal if no verification emails sent yet)')
      return
    }

    console.log(`📊 Found ${tokens.length} token(s):`)
    console.log('')

    tokens.forEach((token, index) => {
      const now = new Date()
      const expiresAt = new Date(token.expires_at)
      const isExpired = expiresAt < now
      const isUsed = token.used

      console.log(`${index + 1}. Token: ${token.token.substring(0, 16)}...`)
      console.log(`   ID: ${token.id}`)
      console.log(`   User ID: ${token.user_id}`)
      console.log(`   Status: ${isUsed ? '🔒 Used' : isExpired ? '⏰ Expired' : '✅ Valid'}`)
      console.log(`   Expires: ${expiresAt.toLocaleString()}`)
      console.log(`   Created: ${new Date(token.created_at).toLocaleString()}`)
      if (isUsed) {
        console.log(`   Used At: ${new Date(token.used_at).toLocaleString()}`)
      }
      console.log('')
    })

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

checkTokens()

