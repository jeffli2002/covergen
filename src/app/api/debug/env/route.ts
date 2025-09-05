import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Only allow in development or with secret header
  const authHeader = req.headers.get('x-debug-secret')
  const isDev = process.env.NODE_ENV !== 'production'
  
  if (!isDev && authHeader !== 'debug-secret-2025') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NEXT_PUBLIC_CREEM_TEST_MODE: process.env.NEXT_PUBLIC_CREEM_TEST_MODE,
    CREEM_SECRET_KEY: {
      exists: !!process.env.CREEM_SECRET_KEY,
      length: process.env.CREEM_SECRET_KEY?.length || 0,
      prefix: process.env.CREEM_SECRET_KEY?.substring(0, 15) || 'NOT_SET',
      startsWithTest: process.env.CREEM_SECRET_KEY?.startsWith('creem_test_') || false
    },
    CREEM_API_KEY: {
      exists: !!process.env.CREEM_API_KEY,
      length: process.env.CREEM_API_KEY?.length || 0,
      prefix: process.env.CREEM_API_KEY?.substring(0, 15) || 'NOT_SET'
    },
    CREEM_PRO_PLAN_ID: {
      exists: !!process.env.CREEM_PRO_PLAN_ID,
      value: process.env.CREEM_PRO_PLAN_ID || 'NOT_SET'
    },
    CREEM_PRO_PLUS_PLAN_ID: {
      exists: !!process.env.CREEM_PRO_PLUS_PLAN_ID,
      value: process.env.CREEM_PRO_PLUS_PLAN_ID || 'NOT_SET'
    },
    // Check all env vars that start with CREEM
    allCreemVars: Object.keys(process.env)
      .filter(key => key.includes('CREEM'))
      .reduce((acc, key) => {
        acc[key] = {
          exists: true,
          length: process.env[key]?.length || 0,
          prefix: process.env[key]?.substring(0, 20) || 'EMPTY'
        }
        return acc
      }, {} as Record<string, any>)
  }

  return NextResponse.json({
    message: 'Environment variables debug info',
    timestamp: new Date().toISOString(),
    env: envVars
  })
}