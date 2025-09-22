// Debug endpoint to check environment variables
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    googleClientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasBestAuthJWT: !!process.env.BESTAUTH_JWT_SECRET,
    nodeEnv: process.env.NODE_ENV,
    // Show first few chars of client ID for debugging (safe to expose)
    googleClientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) || 'undefined',
  })
}