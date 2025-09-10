import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    // Copy from my-saas - just run updateSession
    return await updateSession(request)
}

export const config = {
    matcher: [
        // Match all routes except static files and api routes starting with _
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}