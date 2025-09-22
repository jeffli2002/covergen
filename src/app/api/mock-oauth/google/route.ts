// Mock Google OAuth endpoint for development in WSL2
import { NextRequest, NextResponse } from 'next/server'

// Mock token endpoint
export async function POST(request: NextRequest) {
  const body = await request.text()
  const params = new URLSearchParams(body)
  
  console.log('[Mock OAuth] Token exchange request:', {
    grant_type: params.get('grant_type'),
    code: params.get('code'),
    redirect_uri: params.get('redirect_uri')
  })
  
  // Return a mock access token
  const mockResponse = {
    access_token: 'mock_access_token_' + Date.now(),
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: 'mock_refresh_token_' + Date.now(),
    scope: 'email profile https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid'
  }
  
  return NextResponse.json(mockResponse)
}

// Mock user info endpoint
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  console.log('[Mock OAuth] User info request with auth:', authHeader)
  
  // Return mock user data
  const mockUser = {
    id: '123456789',
    email: 'testuser@example.com',
    verified_email: true,
    name: 'Test User',
    given_name: 'Test',
    family_name: 'User',
    picture: 'https://via.placeholder.com/96',
    locale: 'en'
  }
  
  return NextResponse.json(mockUser)
}