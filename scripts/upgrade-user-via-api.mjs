#!/usr/bin/env node

/**
 * Upgrade user subscription via BestAuth API
 */

import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const email = '994235892@qq.com'
const userId = '57c1c563-4cdd-4471-baa0-f49064b997c9'

console.log(`\n🔧 Upgrading ${email} to Pro via API...\n`)

// Call the BestAuth subscription update API
const apiUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/upgrade-subscription`

const response = await fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.ADMIN_API_KEY || 'admin-secret'}`
  },
  body: JSON.stringify({
    userId: userId,
    tier: 'pro',
    billingCycle: 'monthly',
    status: 'active',
    reason: 'Webhook failed to process upgrade - manual recovery'
  })
})

if (!response.ok) {
  const error = await response.text()
  console.error('❌ API Error:', response.status, error)
  process.exit(1)
}

const result = await response.json()
console.log('✅ Success:', JSON.stringify(result, null, 2))
console.log('\n✅ User should now see Pro plan on account page\n')
