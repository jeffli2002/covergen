import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Direct environment variable access
  const directEnv = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NEXT_PUBLIC_CREEM_TEST_MODE: process.env.NEXT_PUBLIC_CREEM_TEST_MODE,
    CREEM_SECRET_KEY: process.env.CREEM_SECRET_KEY ? 
      `${process.env.CREEM_SECRET_KEY.substring(0, 20)}... (${process.env.CREEM_SECRET_KEY.length} chars)` : 
      'NOT SET'
  }

  // Test the lazy-loaded functions
  let lazyLoadTest: any = {}
  try {
    const { getCreemTestMode, getCreemApiKey, creemService } = await import('@/services/payment/creem')
    
    const apiKey = getCreemApiKey()
    const testMode = getCreemTestMode()
    
    lazyLoadTest = {
      testMode,
      apiKey: apiKey ? `${apiKey.substring(0, 20)}... (${apiKey.length} chars)` : 'NOT FOUND',
      isTestKey: apiKey.startsWith('creem_test_'),
      serviceTestMode: creemService.isTestMode(),
      modeMatches: testMode === apiKey.startsWith('creem_test_')
    }
  } catch (error: any) {
    lazyLoadTest = { error: error.message }
  }

  // Test creating a checkout session
  let checkoutTest: any = {}
  try {
    const { creemService } = await import('@/services/payment/creem')
    
    // Don't actually create a session, just test the validation
    const testUserId = 'test-user-123'
    const testEmail = 'test@example.com'
    
    // This will throw if there's a validation error
    checkoutTest = {
      canCreateCheckout: true,
      testMode: creemService.isTestMode()
    }
  } catch (error: any) {
    checkoutTest = {
      canCreateCheckout: false,
      error: error.message
    }
  }

  return NextResponse.json({
    message: 'Creem environment test',
    timestamp: new Date().toISOString(),
    directEnv,
    lazyLoadTest,
    checkoutTest
  }, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}