import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  
  // Get all query parameters
  const params = new URLSearchParams(url.search)
  
  // Check if this is an OAuth callback with code
  if (params.get('code') || params.get('error')) {
    // Redirect to localhost with all params
    const localUrl = new URL('http://localhost:3001/auth/callback')
    params.forEach((value, key) => {
      localUrl.searchParams.append(key, value)
    })
    
    console.log('[OAuth Fix] Redirecting to localhost:', localUrl.toString())
    return NextResponse.redirect(localUrl)
  }
  
  // Not an OAuth callback, redirect to home
  return NextResponse.redirect('http://localhost:3001')
}