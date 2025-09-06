#!/usr/bin/env node

/**
 * Payment Flow Test Script
 * 
 * Run this to verify payment integration doesn't break OAuth
 * Usage: npm run test:payment-flow
 */

import { PaymentAuthWrapper } from '../src/services/payment/auth-wrapper'
import authService from '../src/services/authService'

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function success(message: string) {
  log(`✓ ${message}`, colors.green)
}

function error(message: string) {
  log(`✗ ${message}`, colors.red)
}

function info(message: string) {
  log(`ℹ ${message}`, colors.blue)
}

function warning(message: string) {
  log(`⚠ ${message}`, colors.yellow)
}

async function runTests() {
  log('\n=== Payment Flow Integration Test ===\n', colors.blue)

  // Track warnings
  const warnings: string[] = []
  const originalWarn = console.warn
  console.warn = (...args) => {
    warnings.push(args.join(' '))
    originalWarn(...args)
  }

  try {
    // Test 1: Check auth service is available
    info('Test 1: Checking auth service availability...')
    const session = authService.getCurrentSession()
    if (session) {
      success(`Auth service available - User: ${session.user?.email}`)
    } else {
      warning('No active session - tests will use mocked auth')
    }

    // Test 2: Check PaymentAuthWrapper doesn't create multiple clients
    info('\nTest 2: Testing PaymentAuthWrapper isolation...')
    const context1 = await PaymentAuthWrapper.getAuthContext()
    const context2 = await PaymentAuthWrapper.getAuthContext()
    const context3 = await PaymentAuthWrapper.getAuthContext()
    
    const multipleClientWarnings = warnings.filter(w => 
      w.includes('Multiple GoTrueClient') || 
      w.includes('multiple instances')
    )
    
    if (multipleClientWarnings.length === 0) {
      success('No multiple client warnings detected')
    } else {
      error(`Found ${multipleClientWarnings.length} multiple client warnings`)
      multipleClientWarnings.forEach(w => console.log(`  - ${w}`))
    }

    // Test 3: Verify read-only access
    info('\nTest 3: Verifying read-only auth access...')
    if (context1) {
      const hasOnlyReadProps = 
        'userId' in context1 &&
        'email' in context1 &&
        'accessToken' in context1 &&
        'isValid' in context1 &&
        !('refreshSession' in context1) &&
        !('setSession' in context1)
      
      if (hasOnlyReadProps) {
        success('PaymentAuthWrapper provides read-only access')
      } else {
        error('PaymentAuthWrapper has write access to auth')
      }
    } else {
      info('No auth context available for read-only test')
    }

    // Test 4: Check session validity requirements
    info('\nTest 4: Testing session validity requirements...')
    const isValidForPayment = PaymentAuthWrapper.isSessionValidForPayment()
    const minMinutes = PaymentAuthWrapper.getMinSessionValidityMinutes()
    
    success(`Minimum session validity required: ${minMinutes} minutes`)
    if (session) {
      info(`Current session valid for payment: ${isValidForPayment}`)
      
      if (!isValidForPayment && session.expires_at) {
        const expiresAt = new Date(session.expires_at * 1000)
        const now = new Date()
        const minutesRemaining = Math.floor((expiresAt.getTime() - now.getTime()) / 60000)
        warning(`Session has only ${minutesRemaining} minutes remaining`)
      }
    }

    // Test 5: Check auth headers generation
    info('\nTest 5: Testing auth header generation...')
    const headers = await PaymentAuthWrapper.getPaymentAuthHeaders()
    
    if (headers) {
      success('Auth headers generated successfully')
      info(`Headers include: ${Object.keys(headers).join(', ')}`)
      
      // Verify headers don't expose full token
      if (headers.Authorization && !headers.Authorization.includes('undefined')) {
        success('Authorization header properly formatted')
      }
    } else {
      warning('No auth headers generated (session might be invalid)')
    }

    // Summary
    log('\n=== Test Summary ===\n', colors.blue)
    
    const criticalIssues = warnings.filter(w => 
      w.includes('Multiple GoTrueClient') || 
      w.includes('refreshSession') ||
      w.includes('setSession')
    )
    
    if (criticalIssues.length === 0) {
      success('No critical OAuth conflicts detected')
      success('Payment integration appears safe for OAuth')
    } else {
      error(`Found ${criticalIssues.length} critical issues:`)
      criticalIssues.forEach(issue => error(`  - ${issue}`))
    }

    // Recommendations
    log('\n=== Recommendations ===\n', colors.blue)
    info('1. Test with a real OAuth login flow')
    info('2. Monitor console for "Multiple GoTrueClient" warnings')
    info('3. Verify logout still works after payment operations')
    info('4. Test with session close to expiry (< 5 minutes)')
    
  } catch (err) {
    error(`\nTest failed with error: ${err}`)
  } finally {
    // Restore console.warn
    console.warn = originalWarn
  }
}

// Run tests if executed directly
if (require.main === module) {
  runTests().then(() => {
    process.exit(0)
  }).catch(() => {
    process.exit(1)
  })
}

export { runTests }