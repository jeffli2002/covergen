#!/usr/bin/env npx tsx
/**
 * Verify that all generation endpoints are properly configured for credit deduction
 */

import * as fs from 'fs'
import * as path from 'path'

const ENDPOINTS = [
  {
    name: 'Image Generation',
    path: 'src/app/api/generate/route.ts',
    generationType: 'nanoBananaImage',
    creditCost: 5,
  },
  {
    name: 'Video Generation (Create)',
    path: 'src/app/api/sora/create/route.ts',
    generationType: 'sora2Video / sora2ProVideo',
    creditCost: '20 / 80',
  },
  {
    name: 'Video Generation (Query)',
    path: 'src/app/api/sora/query/route.ts',
    generationType: 'sora2Video / sora2ProVideo',
    creditCost: '20 / 80',
  },
]

console.log('='.repeat(80))
console.log('CREDIT DEDUCTION FIX VERIFICATION')
console.log('='.repeat(80))
console.log()

let allPassed = true

for (const endpoint of ENDPOINTS) {
  console.log(`Checking: ${endpoint.name}`)
  console.log(`File: ${endpoint.path}`)
  console.log(`Type: ${endpoint.generationType} (${endpoint.creditCost} credits)`)
  
  const filePath = path.join(process.cwd(), endpoint.path)
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`)
    allPassed = false
    console.log()
    continue
  }
  
  const content = fs.readFileSync(filePath, 'utf-8')
  
  // Check for getBestAuthSupabaseClient usage
  const hasServiceRoleClient = content.includes('getBestAuthSupabaseClient()')
  
  // Check for old createClient usage with credit operations
  const badPatterns = [
    /const supabase = await createClient\(\)[\s\S]{0,500}checkPointsForGeneration/,
    /const supabase = await createClient\(\)[\s\S]{0,500}deductPointsForGeneration/,
  ]
  
  const hasBadPattern = badPatterns.some(pattern => pattern.test(content))
  
  // Check for resolveSupabaseUserId (should be removed)
  const hasResolveFunction = content.includes('resolveSupabaseUserId')
  
  const checks = {
    'Uses getBestAuthSupabaseClient': hasServiceRoleClient,
    'No createClient with credit ops': !hasBadPattern,
    'No resolveSupabaseUserId': !hasResolveFunction,
  }
  
  let endpointPassed = true
  for (const [check, passed] of Object.entries(checks)) {
    console.log(`  ${passed ? '✅' : '❌'} ${check}`)
    if (!passed) endpointPassed = false
  }
  
  if (!endpointPassed) {
    allPassed = false
  }
  
  console.log()
}

console.log('='.repeat(80))
if (allPassed) {
  console.log('✅ ALL ENDPOINTS PROPERLY CONFIGURED')
  console.log('All generation endpoints are using service role client for credit operations')
} else {
  console.log('❌ SOME ENDPOINTS NEED ATTENTION')
  console.log('Please review the failed checks above')
  process.exit(1)
}
console.log('='.repeat(80))
