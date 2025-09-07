import { NextRequest, NextResponse } from 'next/server'
import { PaymentAuthWrapper } from '@/services/payment/auth-wrapper'
import authService from '@/services/authService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {
      authServiceAvailable: false,
      sessionValid: false,
      sessionValidForPayment: false,
      authContextAvailable: false,
      authHeadersGenerated: false,
      noMultipleClientWarnings: true
    },
    details: {
      sessionInfo: null as any,
      authContext: null as any,
      warnings: [] as string[]
    }
  }

  // Capture console warnings
  const warnings: string[] = []
  const originalWarn = console.warn
  console.warn = (...args) => {
    const message = args.join(' ')
    warnings.push(message)
    if (message.includes('Multiple GoTrueClient')) {
      results.tests.noMultipleClientWarnings = false
    }
    originalWarn(...args)
  }

  try {
    // Test 1: Auth service availability
    const session = authService.getCurrentSession()
    results.tests.authServiceAvailable = true
    
    if (session) {
      results.tests.sessionValid = true
      results.details.sessionInfo = {
        hasUser: !!session.user,
        userId: session.user?.id,
        email: session.user?.email,
        hasAccessToken: !!session.access_token,
        expiresAt: session.expires_at
      }
    }

    // Test 2: Session validity for payments
    results.tests.sessionValidForPayment = await PaymentAuthWrapper.isSessionValidForPayment()

    // Test 3: Auth context retrieval
    const authContext = await PaymentAuthWrapper.getAuthContext()
    if (authContext) {
      results.tests.authContextAvailable = true
      results.details.authContext = {
        userId: authContext.userId,
        email: authContext.email,
        hasToken: !!authContext.accessToken,
        isValid: authContext.isValid
      }
    }

    // Test 4: Auth headers generation
    const headers = await PaymentAuthWrapper.getPaymentAuthHeaders()
    results.tests.authHeadersGenerated = !!headers

    // Collect warnings
    results.details.warnings = warnings

    // Summary
    const allTestsPassed = Object.values(results.tests).every(test => test === true)

    return NextResponse.json({
      success: true,
      allTestsPassed,
      results
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store'
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Test failed',
      results
    }, { status: 500 })
  } finally {
    // Restore console.warn
    console.warn = originalWarn
  }
}