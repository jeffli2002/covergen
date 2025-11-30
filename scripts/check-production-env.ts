#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

interface EnvCheck {
  name: string
  category: string
  required: boolean
  isSet: boolean
  value?: string
  masked?: boolean
}

function checkProductionEnv() {
  console.log('🔍 Production Environment Variables Checklist')
  console.log('=' .repeat(70))
  console.log('')

  const checks: EnvCheck[] = [
    // Site Configuration
    { name: 'NEXT_PUBLIC_SITE_URL', category: '站点配置', required: true, isSet: !!process.env.NEXT_PUBLIC_SITE_URL, value: process.env.NEXT_PUBLIC_SITE_URL },
    
    // Feature Flags
    { name: 'NEXT_PUBLIC_DEV_MODE', category: '功能开关', required: true, isSet: !!process.env.NEXT_PUBLIC_DEV_MODE, value: process.env.NEXT_PUBLIC_DEV_MODE },
    { name: 'NEXT_PUBLIC_BYPASS_USAGE_LIMIT', category: '功能开关', required: true, isSet: !!process.env.NEXT_PUBLIC_BYPASS_USAGE_LIMIT, value: process.env.NEXT_PUBLIC_BYPASS_USAGE_LIMIT },
    { name: 'NEXT_PUBLIC_CREEM_TEST_MODE', category: '功能开关', required: true, isSet: !!process.env.NEXT_PUBLIC_CREEM_TEST_MODE, value: process.env.NEXT_PUBLIC_CREEM_TEST_MODE },
    
    // Supabase
    { name: 'NEXT_PUBLIC_SUPABASE_URL', category: 'Supabase', required: true, isSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL, value: process.env.NEXT_PUBLIC_SUPABASE_URL },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', category: 'Supabase', required: true, isSet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, masked: true },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', category: 'Supabase', required: true, isSet: !!process.env.SUPABASE_SERVICE_ROLE_KEY, value: process.env.SUPABASE_SERVICE_ROLE_KEY, masked: true },
    
    // BestAuth
    { name: 'BESTAUTH_JWT_SECRET', category: 'BestAuth', required: true, isSet: !!process.env.BESTAUTH_JWT_SECRET, value: process.env.BESTAUTH_JWT_SECRET, masked: true },
    
    // Email Service
    { name: 'RESEND_API_KEY', category: '邮件服务', required: true, isSet: !!process.env.RESEND_API_KEY, value: process.env.RESEND_API_KEY, masked: true },
    { name: 'EMAIL_FROM', category: '邮件服务', required: true, isSet: !!process.env.EMAIL_FROM, value: process.env.EMAIL_FROM },
    { name: 'EMAIL_REPLY_TO', category: '邮件服务', required: true, isSet: !!process.env.EMAIL_REPLY_TO, value: process.env.EMAIL_REPLY_TO },
    { name: 'EMAIL_BCC_SUBSCRIPTION', category: '邮件监控', required: false, isSet: !!process.env.EMAIL_BCC_SUBSCRIPTION, value: process.env.EMAIL_BCC_SUBSCRIPTION },
    { name: 'EMAIL_BCC_PAYMENT_FAILURE', category: '邮件监控', required: false, isSet: !!process.env.EMAIL_BCC_PAYMENT_FAILURE, value: process.env.EMAIL_BCC_PAYMENT_FAILURE },
    { name: 'EMAIL_BCC_CREDITS_EXHAUSTED', category: '邮件监控', required: false, isSet: !!process.env.EMAIL_BCC_CREDITS_EXHAUSTED, value: process.env.EMAIL_BCC_CREDITS_EXHAUSTED },
    { name: 'EMAIL_BCC_BUGS', category: '邮件监控', required: false, isSet: !!process.env.EMAIL_BCC_BUGS, value: process.env.EMAIL_BCC_BUGS },
    
    // Payment Service
    { name: 'NEXT_PUBLIC_CREEM_PUBLIC_KEY', category: '支付服务', required: true, isSet: !!process.env.NEXT_PUBLIC_CREEM_PUBLIC_KEY, value: process.env.NEXT_PUBLIC_CREEM_PUBLIC_KEY, masked: true },
    { name: 'CREEM_SECRET_KEY', category: '支付服务', required: true, isSet: !!process.env.CREEM_SECRET_KEY, value: process.env.CREEM_SECRET_KEY, masked: true },
    { name: 'CREEM_WEBHOOK_SECRET', category: '支付服务', required: true, isSet: !!process.env.CREEM_WEBHOOK_SECRET, value: process.env.CREEM_WEBHOOK_SECRET, masked: true },
    
    // AI Services
    { name: 'OPENAI_API_KEY', category: 'AI 服务', required: true, isSet: !!process.env.OPENAI_API_KEY, value: process.env.OPENAI_API_KEY, masked: true },
    { name: 'REPLICATE_API_TOKEN', category: 'AI 服务', required: true, isSet: !!process.env.REPLICATE_API_TOKEN, value: process.env.REPLICATE_API_TOKEN, masked: true },
    { name: 'FAL_KEY', category: 'AI 服务', required: true, isSet: !!process.env.FAL_KEY, value: process.env.FAL_KEY, masked: true },
  ]

  // Group by category
  const categories = Array.from(new Set(checks.map(c => c.category)))
  
  let totalRequired = 0
  let totalSet = 0
  let missingRequired: string[] = []

  for (const category of categories) {
    const categoryChecks = checks.filter(c => c.category === category)
    const categoryRequired = categoryChecks.filter(c => c.required).length
    const categorySet = categoryChecks.filter(c => c.isSet).length
    
    console.log(`📋 ${category}`)
    console.log('-'.repeat(70))
    
    categoryChecks.forEach(check => {
      const icon = check.isSet ? '✅' : (check.required ? '❌' : '⚠️ ')
      const requiredLabel = check.required ? '(必需)' : '(可选)'
      let valueDisplay = ''
      
      if (check.isSet && check.value) {
        if (check.masked) {
          valueDisplay = ` → ***${check.value.slice(-8)}`
        } else {
          valueDisplay = ` → ${check.value}`
        }
      }
      
      console.log(`${icon} ${check.name} ${requiredLabel}${valueDisplay}`)
      
      if (check.required) {
        totalRequired++
        if (check.isSet) {
          totalSet++
        } else {
          missingRequired.push(check.name)
        }
      }
    })
    console.log('')
  }

  // Summary
  console.log('=' .repeat(70))
  console.log('📊 Summary')
  console.log('=' .repeat(70))
  console.log('')
  console.log(`Total Required Variables: ${totalRequired}`)
  console.log(`✅ Set: ${totalSet}`)
  console.log(`❌ Missing: ${totalRequired - totalSet}`)
  console.log('')

  if (missingRequired.length > 0) {
    console.log('⚠️  Missing Required Variables:')
    missingRequired.forEach(name => {
      console.log(`   ❌ ${name}`)
    })
    console.log('')
    console.log('💡 These variables MUST be added in Vercel before deployment!')
    console.log('')
  }

  // Production readiness check
  console.log('🚦 Production Readiness Check')
  console.log('-'.repeat(70))
  
  const checks_production = [
    { 
      name: 'Dev mode disabled',
      ok: process.env.NEXT_PUBLIC_DEV_MODE === 'false',
      current: process.env.NEXT_PUBLIC_DEV_MODE,
      expected: 'false'
    },
    { 
      name: 'Usage limit enabled',
      ok: process.env.NEXT_PUBLIC_BYPASS_USAGE_LIMIT === 'false',
      current: process.env.NEXT_PUBLIC_BYPASS_USAGE_LIMIT,
      expected: 'false'
    },
    { 
      name: 'Production payment mode',
      ok: process.env.NEXT_PUBLIC_CREEM_TEST_MODE === 'false',
      current: process.env.NEXT_PUBLIC_CREEM_TEST_MODE,
      expected: 'false'
    },
    { 
      name: 'Production domain',
      ok: process.env.NEXT_PUBLIC_SITE_URL?.includes('covergen.pro'),
      current: process.env.NEXT_PUBLIC_SITE_URL,
      expected: 'https://covergen.pro'
    },
    { 
      name: 'Live payment keys',
      ok: process.env.NEXT_PUBLIC_CREEM_PUBLIC_KEY?.startsWith('pk_live_'),
      current: process.env.NEXT_PUBLIC_CREEM_PUBLIC_KEY ? 'pk_***' : 'not set',
      expected: 'pk_live_*'
    },
  ]

  checks_production.forEach(check => {
    const icon = check.ok ? '✅' : '❌'
    console.log(`${icon} ${check.name}`)
    if (!check.ok) {
      console.log(`   Current: ${check.current || 'not set'}`)
      console.log(`   Expected: ${check.expected}`)
    }
  })
  console.log('')

  const allReady = checks_production.every(c => c.ok) && missingRequired.length === 0

  if (allReady) {
    console.log('🎉 Ready for production deployment!')
    console.log('✅ All required variables are set correctly')
  } else {
    console.log('⚠️  NOT ready for production deployment')
    console.log('Please fix the issues above before deploying')
  }
  console.log('=' .repeat(70))
}

checkProductionEnv()





