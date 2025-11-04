#!/usr/bin/env tsx
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function verifyDNSRecords() {
  console.log('🔍 Verifying DNS Records for covergen.pro')
  console.log('=' .repeat(60))
  console.log('')

  const checks = [
    {
      name: 'SPF Record',
      command: 'nslookup -type=txt covergen.pro',
      expected: 'v=spf1 include:_spf.resend.com',
      description: 'Sender Policy Framework record'
    },
    {
      name: 'DKIM Record',
      command: 'nslookup -type=txt resend._domainkey.covergen.pro',
      expected: 'p=',
      description: 'DomainKeys Identified Mail record'
    },
    {
      name: 'DMARC Record',
      command: 'nslookup -type=txt _dmarc.covergen.pro',
      expected: 'v=DMARC1',
      description: 'Domain-based Message Authentication record'
    }
  ]

  let allPassed = true

  for (const check of checks) {
    console.log(`📋 Checking ${check.name}...`)
    console.log(`   ${check.description}`)
    
    try {
      const { stdout } = await execAsync(check.command)
      
      if (stdout.includes(check.expected)) {
        console.log(`   ✅ Found: ${check.name}`)
        
        // Extract and show the value
        const lines = stdout.split('\n')
        const txtLine = lines.find(line => line.includes('text ='))
        if (txtLine) {
          const value = txtLine.trim().replace(/"/g, '')
          console.log(`   📝 ${value}`)
        }
      } else if (stdout.includes('Non-existent domain') || stdout.includes('NXDOMAIN')) {
        console.log(`   ⏳ Not found yet - DNS may still be propagating`)
        allPassed = false
      } else {
        console.log(`   ❌ Not found or incorrect`)
        allPassed = false
      }
    } catch (error: any) {
      console.log(`   ⏳ Not found yet - DNS may still be propagating`)
      allPassed = false
    }
    
    console.log('')
  }

  console.log('=' .repeat(60))
  
  if (allPassed) {
    console.log('✅ All DNS records verified!')
    console.log('')
    console.log('🎉 Next steps:')
    console.log('1. Go to Resend: https://resend.com/domains')
    console.log('2. Find covergen.pro and click "Verify"')
    console.log('3. Wait for verification (usually 5-30 minutes)')
    console.log('4. Update .env.local: EMAIL_FROM=noreply@covergen.pro')
    console.log('5. Test: npm run test:email 994235892@qq.com')
  } else {
    console.log('⏳ Some records not found yet')
    console.log('')
    console.log('💡 This is normal! DNS records take time to propagate:')
    console.log('   • Usually: 5-30 minutes')
    console.log('   • Sometimes: up to 2 hours')
    console.log('')
    console.log('Run this command again in a few minutes:')
    console.log('   npm run verify:dns')
  }
}

verifyDNSRecords()

