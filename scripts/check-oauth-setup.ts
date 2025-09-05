import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function checkOAuthSetup() {
  console.log('🔍 Checking OAuth Setup...\n')
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('1. Environment Variables:')
  console.log(`   - SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`)
  console.log(`   - SUPABASE_ANON_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}`)
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('\n❌ Missing required environment variables!')
    return
  }
  
  console.log('\n2. Supabase Configuration:')
  console.log(`   - Project URL: ${supabaseUrl}`)
  console.log(`   - Project Ref: ${supabaseUrl.match(/https:\/\/(\w+)\.supabase\.co/)?.[1] || 'Unknown'}`)
  
  // Create client and test connection
  console.log('\n3. Testing Connection:')
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.log(`   - Auth Status: ⚠️  Error: ${error.message}`)
    } else {
      console.log(`   - Auth Status: ✅ Working`)
      console.log(`   - Current Session: ${data.session ? 'Active' : 'None'}`)
    }
  } catch (error) {
    console.log(`   - Connection: ❌ Failed - ${error}`)
  }
  
  console.log('\n4. OAuth Callback URL:')
  console.log(`   - Development: http://localhost:3001/auth/callback`)
  console.log(`   - Production: ${process.env.NEXT_PUBLIC_SITE_URL || '[NOT SET]'}/auth/callback`)
  
  console.log('\n📋 Next Steps:')
  console.log('1. Go to Supabase Dashboard > Authentication > Providers')
  console.log('2. Enable Google provider')
  console.log('3. Add your Google OAuth credentials')
  console.log('4. Add the callback URL to "Redirect URLs" in Supabase')
  console.log('5. Add the callback URL to Google Cloud Console authorized redirect URIs')
  
  console.log('\n🔗 Quick Links:')
  const projectRef = supabaseUrl.match(/https:\/\/(\w+)\.supabase\.co/)?.[1]
  if (projectRef) {
    console.log(`   - Supabase Dashboard: https://app.supabase.com/project/${projectRef}/auth/providers`)
    console.log(`   - Google Cloud Console: https://console.cloud.google.com/apis/credentials`)
  }
}

checkOAuthSetup().catch(console.error)