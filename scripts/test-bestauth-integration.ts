#!/usr/bin/env node

/**
 * BestAuth Integration Test Script
 * This script tests the BestAuth integration implementation
 */

import { createHash } from 'crypto'
import chalk from 'chalk'

interface TestResult {
  name: string
  passed: boolean
  error?: string
}

class BestAuthIntegrationTester {
  private results: TestResult[] = []

  async runAllTests() {
    console.log(chalk.blue.bold('\n🔍 BestAuth Integration Test Suite\n'))

    // Test 1: Check middleware file exists
    await this.testMiddlewareExists()

    // Test 2: Check API routes are updated
    await this.testAPIRoutesUpdated()

    // Test 3: Check payment service updates
    await this.testPaymentServiceUpdates()

    // Test 4: Check generation route updates
    await this.testGenerationRouteUpdates()

    // Test 5: Check auth configuration
    await this.testAuthConfiguration()

    // Test 6: Check cookie handling
    await this.testCookieHandling()

    // Print results
    this.printResults()
  }

  async testMiddlewareExists() {
    const testName = 'BestAuth Middleware Implementation'
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      
      const middlewarePath = path.join(process.cwd(), 'src/app/api/middleware/withAuth.ts')
      const exists = await fs.access(middlewarePath).then(() => true).catch(() => false)
      
      if (!exists) {
        throw new Error('Middleware file not found')
      }

      const content = await fs.readFile(middlewarePath, 'utf-8')
      
      // Check for required exports
      const hasWithAuth = content.includes('export function withAuth')
      const hasGetAuthenticatedUser = content.includes('export async function getAuthenticatedUser')
      const usesGetUserFromRequest = content.includes('getUserFromRequest')
      
      if (!hasWithAuth || !hasGetAuthenticatedUser || !usesGetUserFromRequest) {
        throw new Error('Middleware missing required exports or imports')
      }

      this.results.push({ name: testName, passed: true })
    } catch (error) {
      this.results.push({ 
        name: testName, 
        passed: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  async testAPIRoutesUpdated() {
    const testName = 'API Routes Updated with BestAuth'
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      
      const routesToCheck = [
        'src/app/api/payment/create-checkout/route.ts',
        'src/app/api/payment/cancel-subscription/route.ts',
        'src/app/api/generate/route.ts'
      ]

      for (const route of routesToCheck) {
        const routePath = path.join(process.cwd(), route)
        const exists = await fs.access(routePath).then(() => true).catch(() => false)
        
        if (!exists) {
          throw new Error(`Route ${route} not found`)
        }

        const content = await fs.readFile(routePath, 'utf-8')
        
        // Check for BestAuth imports
        const hasWithAuthImport = content.includes('import { withAuth') || 
                                 content.includes('from \'@/app/api/middleware/withAuth\'')
        
        if (!hasWithAuthImport) {
          throw new Error(`Route ${route} missing withAuth import`)
        }

        // For payment routes, check they use withAuth wrapper
        if (route.includes('payment')) {
          const usesWithAuth = content.includes('export const POST = withAuth(')
          if (!usesWithAuth) {
            throw new Error(`Payment route ${route} not using withAuth wrapper`)
          }
        }
      }

      this.results.push({ name: testName, passed: true })
    } catch (error) {
      this.results.push({ 
        name: testName, 
        passed: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  async testPaymentServiceUpdates() {
    const testName = 'Payment Service BestAuth Support'
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      
      const creemPath = path.join(process.cwd(), 'src/services/payment/creem.ts')
      const content = await fs.readFile(creemPath, 'utf-8')
      
      // Check for auth config import
      const hasAuthConfigImport = content.includes('authConfig')
      
      // Check for credentials include
      const hasCredentialsInclude = content.includes('credentials: \'include\'')
      
      // Check for BestAuth conditional logic
      const hasBestAuthCheck = content.includes('authConfig.USE_BESTAUTH')
      
      if (!hasAuthConfigImport || !hasCredentialsInclude || !hasBestAuthCheck) {
        throw new Error('Payment service missing BestAuth support')
      }

      this.results.push({ name: testName, passed: true })
    } catch (error) {
      this.results.push({ 
        name: testName, 
        passed: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  async testGenerationRouteUpdates() {
    const testName = 'Generation Route BestAuth Integration'
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      
      const routePath = path.join(process.cwd(), 'src/app/api/generate/route.ts')
      const content = await fs.readFile(routePath, 'utf-8')
      
      // Check for getAuthenticatedUser usage
      const hasGetAuthenticatedUser = content.includes('getAuthenticatedUser')
      
      // Check for handling both authenticated and unauthenticated
      const handlesUnauthenticated = content.includes('unauthenticatedRequest')
      
      // Check for user from request
      const usesRequestUser = content.includes('request.user')
      
      if (!hasGetAuthenticatedUser || !handlesUnauthenticated || !usesRequestUser) {
        throw new Error('Generation route not properly integrated with BestAuth')
      }

      this.results.push({ name: testName, passed: true })
    } catch (error) {
      this.results.push({ 
        name: testName, 
        passed: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  async testAuthConfiguration() {
    const testName = 'Auth Configuration Setup'
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      
      const configPath = path.join(process.cwd(), 'src/config/auth.config.ts')
      const content = await fs.readFile(configPath, 'utf-8')
      
      // Check USE_BESTAUTH is true
      const usesBestAuth = content.includes('USE_BESTAUTH: true')
      
      if (!usesBestAuth) {
        throw new Error('BestAuth is not enabled in auth config')
      }

      this.results.push({ name: testName, passed: true })
    } catch (error) {
      this.results.push({ 
        name: testName, 
        passed: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  async testCookieHandling() {
    const testName = 'Cookie-based Authentication'
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      
      // Check BestAuth payment service
      const paymentServicePath = path.join(process.cwd(), 'src/services/payment/bestauth-payment.ts')
      const exists = await fs.access(paymentServicePath).then(() => true).catch(() => false)
      
      if (!exists) {
        throw new Error('BestAuth payment service not found')
      }

      const content = await fs.readFile(paymentServicePath, 'utf-8')
      
      // Check all fetch calls use credentials: 'include'
      const fetchCalls = content.match(/fetch\([^)]+\)/g) || []
      let allUseCredentials = true
      
      for (const fetchCall of fetchCalls) {
        const blockContent = content.substring(content.indexOf(fetchCall), content.indexOf(fetchCall) + 200)
        if (!blockContent.includes('credentials: \'include\'')) {
          allUseCredentials = false
          break
        }
      }
      
      if (!allUseCredentials) {
        throw new Error('Not all fetch calls use credentials: include')
      }

      this.results.push({ name: testName, passed: true })
    } catch (error) {
      this.results.push({ 
        name: testName, 
        passed: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  private printResults() {
    console.log(chalk.bold('\n📊 Test Results:\n'))

    const passed = this.results.filter(r => r.passed).length
    const failed = this.results.filter(r => !r.passed).length
    const total = this.results.length

    for (const result of this.results) {
      const icon = result.passed ? '✅' : '❌'
      const color = result.passed ? chalk.green : chalk.red
      
      console.log(`${icon} ${color(result.name)}`)
      if (result.error) {
        console.log(`   ${chalk.gray(result.error)}`)
      }
    }

    console.log('\n' + chalk.bold('Summary:'))
    console.log(chalk.green(`  Passed: ${passed}/${total}`))
    if (failed > 0) {
      console.log(chalk.red(`  Failed: ${failed}/${total}`))
    }

    const percentage = Math.round((passed / total) * 100)
    const percentageColor = percentage === 100 ? chalk.green : percentage >= 80 ? chalk.yellow : chalk.red
    console.log(percentageColor(`  Success Rate: ${percentage}%`))

    if (percentage === 100) {
      console.log(chalk.green.bold('\n🎉 All tests passed! BestAuth integration is complete.\n'))
    } else {
      console.log(chalk.yellow.bold('\n⚠️  Some tests failed. Please review the implementation.\n'))
      process.exit(1)
    }
  }
}

// Run tests
async function main() {
  const tester = new BestAuthIntegrationTester()
  await tester.runAllTests()
}

main().catch(error => {
  console.error(chalk.red('Test script failed:'), error)
  process.exit(1)
})