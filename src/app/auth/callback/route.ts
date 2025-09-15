import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/en'

  if (code) {
    const supabase = await createSupabaseClient()
    await supabase.auth.exchangeCodeForSession(code)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Successfully authenticated
      console.log('[OAuth Callback] User authenticated:', user.email)
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // If there's an error or no code, redirect to home
  return NextResponse.redirect(new URL('/en', request.url))
}