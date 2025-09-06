import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get auth cookies
    const cookies = request.cookies.getAll()
    const authCookies = cookies.filter(c => 
      c.name.includes('sb-') && c.name.includes('auth-token')
    ).sort((a, b) => {
      const aNum = parseInt(a.name.split('.').pop() || '0')
      const bNum = parseInt(b.name.split('.').pop() || '0')
      return aNum - bNum
    })
    
    if (authCookies.length === 0) {
      return NextResponse.json({ 
        authenticated: false,
        error: 'No auth cookies found'
      })
    }
    
    // Reconstruct token from chunks
    const fullToken = authCookies.map(c => c.value).join('')
    
    // Decode token
    let tokenData
    try {
      const decoded = Buffer.from(fullToken, 'base64').toString('utf8')
      tokenData = JSON.parse(decoded)
    } catch (e) {
      return NextResponse.json({ 
        authenticated: false,
        error: 'Invalid token format'
      })
    }
    
    // Verify token with Supabase
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        }
      }
    )
    
    if (response.ok) {
      const userData = await response.json()
      return NextResponse.json({
        authenticated: true,
        user: userData
      })
    }
    
    return NextResponse.json({
      authenticated: false,
      error: 'Invalid token'
    })
  } catch (error) {
    return NextResponse.json({
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}