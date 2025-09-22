// Debug endpoint to verify environment variables
import { NextResponse } from 'next/server'
import { authConfig } from '@/lib/bestauth/config'

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const envStatus = {
    NODE_ENV: process.env.NODE_ENV,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing',
    BESTAUTH_JWT_SECRET: process.env.BESTAUTH_JWT_SECRET ? 'Set' : 'Missing',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'Not set',
  }

  const configStatus = {
    google: {
      clientId: authConfig.oauth.google.clientId ? 'Set' : 'Missing',
      clientSecret: authConfig.oauth.google.clientSecret ? 'Set' : 'Missing',
    },
    jwt: {
      secret: authConfig.jwt.secret ? 'Set' : 'Missing',
    },
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: envStatus,
    config: configStatus,
    message: 'Check server logs for more detailed output from config.ts',
  })
}