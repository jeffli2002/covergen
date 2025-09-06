import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const cookies = request.cookies.getAll()
    const authCookies = cookies.filter(c => c.name.includes('sb-') && c.name.includes('auth-token'))
    
    if (authCookies.length === 0) {
      return NextResponse.json({ 
        error: 'No auth cookies found',
        allCookies: cookies.map(c => c.name)
      })
    }
    
    // Reconstruct the token from chunks
    let fullToken = ''
    for (let i = 0; i < authCookies.length; i++) {
      const chunk = authCookies.find(c => c.name.endsWith(`.${i}`))
      if (chunk) {
        fullToken += chunk.value
      }
    }
    
    // Decode the token
    let tokenData
    try {
      const decoded = Buffer.from(fullToken, 'base64').toString('utf8')
      tokenData = JSON.parse(decoded)
    } catch (e) {
      return NextResponse.json({ 
        error: 'Failed to decode token',
        message: e instanceof Error ? e.message : 'Unknown error'
      })
    }
    
    // Make a direct API call to Supabase to verify the token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      }
    })
    
    const userData = await response.json()
    
    return NextResponse.json({
      cookieFound: true,
      tokenDecoded: true,
      hasAccessToken: !!tokenData.access_token,
      userApiResponse: {
        status: response.status,
        data: userData
      },
      supabaseUrl,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}