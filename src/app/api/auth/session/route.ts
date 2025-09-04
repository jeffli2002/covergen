import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  
  const supabase = createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  return NextResponse.json({
    session: session ? {
      user: session.user?.email,
      expires_at: session.expires_at
    } : null,
    error: error?.message,
    cookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
    hasSbCookies: allCookies.some(c => c.name.startsWith('sb-'))
  })
}