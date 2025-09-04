import { NextRequest, NextResponse } from 'next/server'
import { Creem } from 'creem'

export async function GET(req: NextRequest) {
  const CREEM_API_KEY = process.env.CREEM_SECRET_KEY || ''
  const CREEM_TEST_MODE = process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_CREEM_TEST_MODE === 'true'
  
  console.log('[Test Creem] Environment:', {
    hasApiKey: !!CREEM_API_KEY,
    apiKeyLength: CREEM_API_KEY.length,
    apiKeyPrefix: CREEM_API_KEY.substring(0, 15),
    testMode: CREEM_TEST_MODE,
    nodeEnv: process.env.NODE_ENV,
    allCreemEnvVars: Object.keys(process.env).filter(k => k.includes('CREEM')).map(k => ({
      key: k,
      hasValue: !!process.env[k],
      length: process.env[k]?.length || 0
    }))
  })

  try {
    // Test 1: Initialize SDK
    const creemClient = new Creem({
      serverIdx: CREEM_TEST_MODE ? 1 : 0,
    })
    
    // Test 2: Try a simple checkout
    const testCheckout = await creemClient.createCheckout({
      xApiKey: CREEM_API_KEY,
      createCheckoutRequest: {
        productId: 'prod_7aQWgvmz1JHGafTEGZtz9g',
        requestId: `test_${Date.now()}`,
        successUrl: 'http://localhost:3001/success',
        customer: {
          email: 'test@example.com',
        },
      }
    })
    
    return NextResponse.json({
      success: true,
      result: testCheckout,
      env: {
        hasApiKey: !!CREEM_API_KEY,
        apiKeyLength: CREEM_API_KEY.length,
        testMode: CREEM_TEST_MODE
      }
    })
  } catch (error: any) {
    console.error('[Test Creem] Error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status,
      fullError: JSON.stringify(error, null, 2)
    })
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      },
      env: {
        hasApiKey: !!CREEM_API_KEY,
        apiKeyLength: CREEM_API_KEY.length,
        testMode: CREEM_TEST_MODE
      }
    }, { status: 500 })
  }
}