import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Only allow in development or test environments
  const isDev = process.env.NODE_ENV !== 'production'
  const isTest = process.env.NEXT_PUBLIC_CREEM_TEST_MODE === 'true'
  
  if (!isDev && !isTest) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Import the functions from creem service
  const { getCreemTestMode, getCreemApiKey } = await import('@/services/payment/creem')
  
  // Test various ways to access the environment variable
  const directAccess = process.env.CREEM_SECRET_KEY
  const lazyAccess = getCreemApiKey()
  
  const envInfo = {
    timestamp: new Date().toISOString(),
    runtime: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      vercel: process.env.VERCEL,
      isDev,
      isTest
    },
    creemConfig: {
      testMode: getCreemTestMode(),
      directApiKey: {
        exists: !!directAccess,
        length: directAccess?.length || 0,
        prefix: directAccess?.substring(0, 15) || 'NOT_SET',
        isTestKey: directAccess?.startsWith('creem_test_') || false
      },
      lazyApiKey: {
        exists: !!lazyAccess,
        length: lazyAccess?.length || 0,
        prefix: lazyAccess?.substring(0, 15) || 'NOT_SET',
        isTestKey: lazyAccess?.startsWith('creem_test_') || false
      },
      allCreemEnvVars: Object.keys(process.env)
        .filter(key => key.includes('CREEM'))
        .reduce((acc, key) => {
          const value = process.env[key]
          acc[key] = {
            exists: !!value,
            length: value?.length || 0,
            prefix: value?.substring(0, 20) || 'EMPTY',
            isSecret: key.includes('SECRET') || key.includes('KEY')
          }
          return acc
        }, {} as Record<string, any>)
    },
    productIds: {
      pro: process.env.CREEM_PRO_PLAN_ID || 'NOT_SET',
      proPlus: process.env.CREEM_PRO_PLUS_PLAN_ID || 'NOT_SET'
    }
  }

  // Try to create a test checkout session to see what happens
  let testCheckout = null
  try {
    const { creemService } = await import('@/services/payment/creem')
    const apiKey = getCreemApiKey()
    
    testCheckout = {
      apiKeyAvailable: !!apiKey,
      testModeActive: creemService.isTestMode(),
      apiKeyMatchesMode: creemService.isTestMode() ? 
        apiKey.startsWith('creem_test_') : 
        !apiKey.startsWith('creem_test_')
    }
  } catch (error: any) {
    testCheckout = {
      error: error.message,
      stack: error.stack
    }
  }

  return NextResponse.json({
    message: 'Creem environment debug info',
    env: envInfo,
    testCheckout
  }, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  })
}