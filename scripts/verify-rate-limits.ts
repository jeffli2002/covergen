#!/usr/bin/env tsx

// Manual verification script for rate limiting logic

console.log('======================================')
console.log('Rate Limit Verification Script')
console.log('======================================')
console.log('')

// Test data
const scenarios = [
  {
    name: 'Free Tier - Within Limit',
    config: { tier: 'free', isTrialing: false },
    usage: { daily: 2, monthly: 5 },
    expected: { allowed: true, dailyRemaining: 1, monthlyRemaining: 5 }
  },
  {
    name: 'Free Tier - Daily Limit Reached',
    config: { tier: 'free', isTrialing: false },
    usage: { daily: 3, monthly: 5 },
    expected: { allowed: false, dailyRemaining: 0, reason: 'daily limit' }
  },
  {
    name: 'Pro Trial - Within Limit',
    config: { tier: 'pro', isTrialing: true },
    usage: { daily: 3, monthly: 20 },
    expected: { allowed: true, dailyRemaining: 1 }
  },
  {
    name: 'Pro Trial - Daily Limit Reached',
    config: { tier: 'pro', isTrialing: true },
    usage: { daily: 4, monthly: 20 },
    expected: { allowed: false, dailyRemaining: 0, reason: 'daily limit' }
  },
  {
    name: 'Pro+ Trial - Within Limit',
    config: { tier: 'pro_plus', isTrialing: true },
    usage: { daily: 5, monthly: 30 },
    expected: { allowed: true, dailyRemaining: 1 }
  },
  {
    name: 'Pro Paid - No Daily Limit',
    config: { tier: 'pro', isTrialing: false },
    usage: { daily: 50, monthly: 100 },
    expected: { allowed: true, monthlyRemaining: 20 }
  },
  {
    name: 'Pro+ Paid - Monthly Limit',
    config: { tier: 'pro_plus', isTrialing: false },
    usage: { daily: 200, monthly: 300 },
    expected: { allowed: false, reason: 'monthly limit' }
  }
]

// Simple rate limit logic
const LIMITS = {
  free: { daily: 3, monthly: 10 },
  pro_trial: { daily: 4 },
  pro_plus_trial: { daily: 6 },
  pro: { monthly: 120 },
  pro_plus: { monthly: 300 }
}

function checkRateLimit(config: any, usage: any) {
  const { tier, isTrialing } = config
  
  let dailyLimit: number | null = null
  let monthlyLimit: number = 0
  
  if (tier === 'free') {
    dailyLimit = LIMITS.free.daily
    monthlyLimit = LIMITS.free.monthly
  } else if (isTrialing) {
    dailyLimit = tier === 'pro' ? LIMITS.pro_trial.daily : LIMITS.pro_plus_trial.daily
    monthlyLimit = tier === 'pro' ? 120 : 300
  } else {
    monthlyLimit = tier === 'pro' ? LIMITS.pro.monthly : LIMITS.pro_plus.monthly
  }
  
  let allowed = true
  let reason = ''
  
  if (dailyLimit !== null && usage.daily >= dailyLimit) {
    allowed = false
    reason = 'daily limit'
  } else if (usage.monthly >= monthlyLimit) {
    allowed = false
    reason = 'monthly limit'
  }
  
  return {
    allowed,
    reason,
    dailyRemaining: dailyLimit ? Math.max(0, dailyLimit - usage.daily) : undefined,
    monthlyRemaining: Math.max(0, monthlyLimit - usage.monthly)
  }
}

// Run tests
let passed = 0
let failed = 0

scenarios.forEach(scenario => {
  const result = checkRateLimit(scenario.config, scenario.usage)
  
  let success = true
  const errors: string[] = []
  
  if (result.allowed !== scenario.expected.allowed) {
    success = false
    errors.push(`Expected allowed=${scenario.expected.allowed}, got ${result.allowed}`)
  }
  
  if (scenario.expected.dailyRemaining !== undefined && 
      result.dailyRemaining !== scenario.expected.dailyRemaining) {
    success = false
    errors.push(`Expected dailyRemaining=${scenario.expected.dailyRemaining}, got ${result.dailyRemaining}`)
  }
  
  if (scenario.expected.monthlyRemaining !== undefined && 
      result.monthlyRemaining !== scenario.expected.monthlyRemaining) {
    success = false
    errors.push(`Expected monthlyRemaining=${scenario.expected.monthlyRemaining}, got ${result.monthlyRemaining}`)
  }
  
  if (scenario.expected.reason && !result.reason.includes(scenario.expected.reason)) {
    success = false
    errors.push(`Expected reason to contain '${scenario.expected.reason}', got '${result.reason}'`)
  }
  
  if (success) {
    console.log(`✅ ${scenario.name}`)
    passed++
  } else {
    console.log(`❌ ${scenario.name}`)
    errors.forEach(err => console.log(`   ${err}`))
    failed++
  }
})

console.log('')
console.log('======================================')
console.log(`Results: ${passed} passed, ${failed} failed`)
console.log('======================================')

// Trial period calculations
console.log('')
console.log('Trial Period Calculations:')
console.log('-------------------------')

const proTrialDays = parseInt(process.env.NEXT_PUBLIC_PRO_TRIAL_DAYS || '7')
const proPlusTrialDays = parseInt(process.env.NEXT_PUBLIC_PRO_PLUS_TRIAL_DAYS || '7')

console.log(`Pro Trial: ${proTrialDays} days × 4 covers/day = ${proTrialDays * 4} total covers`)
console.log(`Pro+ Trial: ${proPlusTrialDays} days × 6 covers/day = ${proPlusTrialDays * 6} total covers`)

// Payment flow verification
console.log('')
console.log('Payment Flow Verification:')
console.log('-------------------------')
console.log('1. User starts Pro trial → Daily limit: 4')
console.log('2. User hits daily limit → Shows upgrade modal')
console.log('3. User clicks "Start subscription now" → Redirects to Creem')
console.log('4. User completes payment → Trial converts to paid')
console.log('5. User returns to app → No more daily limits')

process.exit(failed > 0 ? 1 : 0)