import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Redirect to the new official callback route
  const url = new URL(request.url)
  const newUrl = new URL('/auth/callback-official', url.origin)
  
  // Preserve all query parameters
  url.searchParams.forEach((value, key) => {
    newUrl.searchParams.append(key, value)
  })
  
  console.log('[Auth Callback] Redirecting to official callback:', newUrl.toString())
  return NextResponse.redirect(newUrl)
}