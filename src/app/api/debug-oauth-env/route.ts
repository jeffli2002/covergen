import { NextResponse } from 'next/server'
import { authConfig } from '@/lib/bestauth/config'

export async function GET() {
  const googleConfig = authConfig.oauth.google;
  
  return NextResponse.json({
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
      BESTAUTH_JWT_SECRET: process.env.BESTAUTH_JWT_SECRET ? 'SET' : 'NOT SET',
    },
    authConfig: {
      google: {
        clientId: googleConfig.clientId ? 'SET' : 'NOT SET', 
        clientSecret: googleConfig.clientSecret ? 'SET' : 'NOT SET',
        authorizationUrl: googleConfig.authorizationUrl,
        tokenUrl: googleConfig.tokenUrl,
        userInfoUrl: googleConfig.userInfoUrl,
        scope: googleConfig.scope,
      }
    },
    rawEnv: {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'undefined',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'HIDDEN' : 'undefined',
    }
  });
}