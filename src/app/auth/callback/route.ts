import { NextResponse, NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/en'
    const error = requestUrl.searchParams.get('error')
    
    console.log('[OAuth Callback] Processing:', { 
        hasCode: !!code, 
        hasError: !!error, 
        next 
    })

    // Handle OAuth errors from provider
    if (error) {
        console.error('[OAuth Callback] Provider error:', error)
        return NextResponse.redirect(
            `${requestUrl.origin}${next}?error=oauth_failed&message=${encodeURIComponent(error)}`
        )
    }

    if (code) {
        try {
            const cookieStore = cookies()
            
            // Create response object that we'll add cookies to
            const redirectUrl = new URL(next, requestUrl.origin)
            redirectUrl.searchParams.set('oauth_return', 'true') // Mark that we're returning from OAuth
            const response = NextResponse.redirect(redirectUrl)
            
            // Create Supabase client with cookie handling
            const supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        getAll() {
                            return cookieStore.getAll()
                        },
                        setAll(cookiesToSet) {
                            // Set cookies on the response object
                            cookiesToSet.forEach(({ name, value, options }) => {
                                response.cookies.set(name, value, options)
                            })
                        },
                    },
                }
            )
            
            // Exchange the code for a session
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
            
            if (exchangeError) {
                console.error('[OAuth Callback] Code exchange failed:', exchangeError)
                return NextResponse.redirect(
                    `${requestUrl.origin}${next}?error=exchange_failed&message=${encodeURIComponent(exchangeError.message)}`
                )
            }

            if (!data.session) {
                console.error('[OAuth Callback] No session returned')
                return NextResponse.redirect(
                    `${requestUrl.origin}${next}?error=no_session&message=Failed to establish session`
                )
            }

            console.log('[OAuth Callback] Code exchange successful:', {
                user: data.session.user.email,
                expiresAt: data.session.expires_at
            })
            
            // Important: For OAuth to work properly, we need to ensure the client
            // can detect the session. Add a flag to indicate OAuth success.
            redirectUrl.searchParams.set('oauth_success', 'true')
            
            // Update the response with the new URL
            const finalResponse = NextResponse.redirect(redirectUrl)
            
            // Copy all cookies from the original response
            response.cookies.getAll().forEach(cookie => {
                finalResponse.cookies.set(cookie.name, cookie.value, cookie)
            })
            
            // Return response with cookies set
            return finalResponse
        } catch (error: any) {
            console.error('[OAuth Callback] Unexpected error:', error)
            return NextResponse.redirect(
                `${requestUrl.origin}${next}?error=unexpected&message=${encodeURIComponent(error.message || 'An unexpected error occurred')}`
            )
        }
    }

    // No code provided
    console.error('[OAuth Callback] No code parameter')
    return NextResponse.redirect(
        `${requestUrl.origin}${next}?error=no_code&message=OAuth authorization code missing`
    )
}