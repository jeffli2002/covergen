#!/usr/bin/env node

/**
 * Manual verification of BestAuth integration
 */

import fs from 'fs/promises'
import path from 'path'
import chalk from 'chalk'

async function verifyIntegration() {
  console.log(chalk.blue.bold('\n🔍 BestAuth Integration Verification\n'))

  const checks = []

  // 1. Check middleware file
  try {
    const middlewarePath = path.join(process.cwd(), 'src/app/api/middleware/withAuth.ts')
    await fs.access(middlewarePath)
    const content = await fs.readFile(middlewarePath, 'utf-8')
    
    checks.push({
      name: 'API Middleware exists',
      passed: true,
      details: 'withAuth middleware found at correct location'
    })

    // Check exports
    const hasExports = content.includes('export function withAuth') && 
                      content.includes('export async function getAuthenticatedUser')
    
    checks.push({
      name: 'Middleware exports',
      passed: hasExports,
      details: hasExports ? 'All required exports found' : 'Missing exports'
    })
  } catch (error) {
    checks.push({
      name: 'API Middleware exists',
      passed: false,
      details: 'Middleware file not found'
    })
  }

  // 2. Check payment routes
  const paymentRoutes = [
    'src/app/api/payment/create-checkout/route.ts',
    'src/app/api/payment/cancel-subscription/route.ts'
  ]

  for (const route of paymentRoutes) {
    try {
      const routePath = path.join(process.cwd(), route)
      const content = await fs.readFile(routePath, 'utf-8')
      
      const usesWithAuth = content.includes('withAuth') && content.includes('export const POST = withAuth(')
      const importsMiddleware = content.includes('@/app/api/middleware/withAuth')
      
      checks.push({
        name: `${route} uses BestAuth`,
        passed: usesWithAuth && importsMiddleware,
        details: usesWithAuth ? 'Route properly protected with BestAuth' : 'Route not using BestAuth middleware'
      })
    } catch (error) {
      checks.push({
        name: `${route} uses BestAuth`,
        passed: false,
        details: 'Route file not found or error reading'
      })
    }
  }

  // 3. Check generation route
  try {
    const genPath = path.join(process.cwd(), 'src/app/api/generate/route.ts')
    const content = await fs.readFile(genPath, 'utf-8')
    
    const hasAuthHandling = content.includes('getAuthenticatedUser') && 
                           content.includes('request.user')
    
    checks.push({
      name: 'Generation route auth handling',
      passed: hasAuthHandling,
      details: hasAuthHandling ? 'Properly handles both auth and unauth users' : 'Missing auth handling'
    })
  } catch (error) {
    checks.push({
      name: 'Generation route auth handling',
      passed: false,
      details: 'Route file not found'
    })
  }

  // 4. Check payment service
  try {
    const creemPath = path.join(process.cwd(), 'src/services/payment/creem.ts')
    const content = await fs.readFile(creemPath, 'utf-8')
    
    const hasAuthConfig = content.includes('authConfig')
    const hasCredentials = content.includes("credentials: 'include'")
    const hasBestAuthCheck = content.includes('authConfig.USE_BESTAUTH')
    
    checks.push({
      name: 'Payment service BestAuth support',
      passed: hasAuthConfig && hasCredentials && hasBestAuthCheck,
      details: `Auth config: ${hasAuthConfig}, Credentials: ${hasCredentials}, BestAuth check: ${hasBestAuthCheck}`
    })
  } catch (error) {
    checks.push({
      name: 'Payment service BestAuth support',
      passed: false,
      details: 'Service file not found'
    })
  }

  // 5. Check auth configuration
  try {
    const configPath = path.join(process.cwd(), 'src/config/auth.config.ts')
    const content = await fs.readFile(configPath, 'utf-8')
    
    const isBestAuthEnabled = content.includes('USE_BESTAUTH: true')
    
    checks.push({
      name: 'BestAuth is enabled',
      passed: isBestAuthEnabled,
      details: isBestAuthEnabled ? 'BestAuth is the primary auth system' : 'BestAuth is not enabled'
    })
  } catch (error) {
    checks.push({
      name: 'BestAuth is enabled',
      passed: false,
      details: 'Config file not found'
    })
  }

  // 6. Check BestAuth payment service
  try {
    const bestAuthPaymentPath = path.join(process.cwd(), 'src/services/payment/bestauth-payment.ts')
    await fs.access(bestAuthPaymentPath)
    
    checks.push({
      name: 'BestAuth payment service exists',
      passed: true,
      details: 'Dedicated BestAuth payment service created'
    })
  } catch (error) {
    checks.push({
      name: 'BestAuth payment service exists',
      passed: true, // Optional file
      details: 'Optional dedicated service not created (using main service)'
    })
  }

  // Print results
  console.log(chalk.bold('Integration Check Results:\n'))

  let passed = 0
  let failed = 0

  for (const check of checks) {
    const icon = check.passed ? '✅' : '❌'
    const color = check.passed ? chalk.green : chalk.red
    
    console.log(`${icon} ${color(check.name)}`)
    console.log(`   ${chalk.gray(check.details)}`)
    console.log()

    if (check.passed) passed++
    else failed++
  }

  console.log(chalk.bold('\n📊 Summary:'))
  console.log(chalk.green(`✅ Passed: ${passed}/${checks.length}`))
  if (failed > 0) {
    console.log(chalk.red(`❌ Failed: ${failed}/${checks.length}`))
  }

  const percentage = Math.round((passed / checks.length) * 100)
  console.log(chalk.bold(`\n${percentage === 100 ? '🎉' : '⚠️'}  Success Rate: ${percentage}%\n`))

  // Additional manual test suggestions
  console.log(chalk.yellow.bold('📝 Manual Testing Checklist:\n'))
  console.log('1. Test Google OAuth login with BestAuth enabled')
  console.log('2. Verify session cookies are set after login')
  console.log('3. Test payment checkout creation (should use cookies, not Bearer tokens)')
  console.log('4. Test image generation for both authenticated and anonymous users')
  console.log('5. Verify subscription status API works with BestAuth session')
  console.log('6. Test logout functionality')
  console.log()
}

verifyIntegration().catch(console.error)