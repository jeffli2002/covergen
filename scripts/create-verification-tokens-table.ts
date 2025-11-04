#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

async function createVerificationTokensTable() {
  console.log('📋 Creating bestauth_verification_tokens table')
  console.log('=' .repeat(70))
  console.log('')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('📝 Running SQL migration...')
  console.log('')

  const sql = `
-- Create verification tokens table for email verification
CREATE TABLE IF NOT EXISTS bestauth_verification_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES bestauth_users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bestauth_verification_tokens_token ON bestauth_verification_tokens(token) WHERE used = false;
CREATE INDEX IF NOT EXISTS idx_bestauth_verification_tokens_user_id ON bestauth_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_bestauth_verification_tokens_expires ON bestauth_verification_tokens(expires_at) WHERE used = false;

-- Grant permissions
GRANT ALL ON bestauth_verification_tokens TO authenticated;
GRANT SELECT ON bestauth_verification_tokens TO anon;
  `.trim()

  console.log(sql)
  console.log('')

  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      // Try direct execution if RPC doesn't work
      console.log('⚠️  RPC method failed, trying direct execution...')
      console.log('')
      
      // Split SQL into individual statements
      const statements = sql.split(';').filter(s => s.trim())
      
      for (const statement of statements) {
        const trimmed = statement.trim()
        if (!trimmed) continue
        
        console.log(`Executing: ${trimmed.substring(0, 50)}...`)
        
        const { error: execError } = await supabase.from('_sql').select().limit(0)
        
        if (execError) {
          console.log(`   ⚠️  ${execError.message}`)
        }
      }
      
      console.log('')
      console.log('⚠️  Could not execute SQL directly')
      console.log('')
      console.log('📝 Please run this SQL manually in Supabase SQL Editor:')
      console.log('   https://supabase.com/dashboard/project/_/sql')
      console.log('')
      console.log('Copy and paste the SQL above into the editor and click "Run"')
      console.log('')
    } else {
      console.log('✅ Table created successfully!')
      console.log('')
    }

    // Verify table exists
    const { data: tables, error: checkError } = await supabase
      .from('bestauth_verification_tokens')
      .select('count')
      .limit(0)

    if (checkError) {
      if (checkError.code === 'PGRST116' || checkError.message.includes('not found')) {
        console.log('❌ Table still not found')
        console.log('')
        console.log('📝 Manual steps required:')
        console.log('1. Go to https://supabase.com/dashboard')
        console.log('2. Select your project')
        console.log('3. Go to SQL Editor')
        console.log('4. Copy and paste the SQL from above')
        console.log('5. Click "Run"')
        console.log('')
      } else {
        console.log(`⚠️  Verification error: ${checkError.message}`)
      }
    } else {
      console.log('✅ Table verified - bestauth_verification_tokens exists!')
      console.log('')
      console.log('🎉 Setup complete! You can now test email verification:')
      console.log('   npm run test:email:verification your-email@example.com')
      console.log('')
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

createVerificationTokensTable()

