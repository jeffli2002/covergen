import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  
  // Extract all query parameters
  const queryParams: Record<string, string> = {}
  url.searchParams.forEach((value, key) => {
    queryParams[key] = value
  })
  
  // Get raw cookie header
  const cookieHeader = request.headers.get('cookie') || 'NO COOKIES'
  
  // Parse cookies
  const cookies: Record<string, string> = {}
  if (cookieHeader !== 'NO COOKIES') {
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...valueParts] = cookie.trim().split('=')
      if (name) {
        cookies[name] = valueParts.join('=')
      }
    })
  }
  
  // Look for state-related cookies
  const stateCookies = Object.entries(cookies).filter(([name]) => 
    name.includes('state') || 
    name.includes('flow') || 
    name.includes('pkce') ||
    name.includes('code-verifier')
  )
  
  // Create debug response
  const debugInfo = {
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method,
    headers: {
      host: request.headers.get('host'),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
      'user-agent': request.headers.get('user-agent'),
    },
    queryParams,
    cookieHeader,
    parsedCookies: cookies,
    stateCookies: Object.fromEntries(stateCookies),
    analysis: {
      hasCode: !!queryParams.code,
      hasState: !!queryParams.state,
      hasCodeVerifier: Object.keys(cookies).some(name => name.includes('code-verifier')),
      hasStateCookie: Object.keys(cookies).some(name => name.includes('state') || name.includes('flow')),
      stateMatches: null as boolean | null
    }
  }
  
  // Check if state matches any cookie
  if (queryParams.state && debugInfo.analysis.hasStateCookie) {
    const stateValue = queryParams.state
    const matchingCookie = Object.entries(cookies).find(([_, value]) => value === stateValue)
    debugInfo.analysis.stateMatches = !!matchingCookie
  }
  
  // Return as JSON for easy viewing
  return NextResponse.json(debugInfo, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  })
}