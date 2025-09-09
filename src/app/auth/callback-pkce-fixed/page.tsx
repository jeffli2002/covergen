'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function CallbackPKCEFixed() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('Initializing...')
  const hasProcessed = useRef(false)
  
  useEffect(() => {
    // Ensure we only process once
    if (hasProcessed.current) return
    hasProcessed.current = true
    
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const next = params.get('next') || '/en'
        
        console.log('[Callback PKCE Fixed] Starting with:', { code: code?.substring(0, 10), next })
        
        if (!code) {
          setError('No authorization code found')
          setTimeout(() => router.push(`${next}?error=no_code`), 2000)
          return
        }
        
        setStatus('Processing authentication...')
        
        // Wait a moment to ensure localStorage is ready
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Import Supabase client
        const { createClient } = await import('@supabase/supabase-js')
        
        // Create a fresh client instance to ensure proper initialization
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            auth: {
              autoRefreshToken: true,
              persistSession: true,
              detectSessionInUrl: false, // Important: we handle this manually
              flowType: 'pkce',
              storage: window.localStorage,
            }
          }
        )
        
        setStatus('Completing sign in...')
        
        try {
          // Use the Supabase helper method that handles PKCE properly
          const { data, error: sessionError } = await supabase.auth.getSession()
          
          // If no session yet, exchange the code
          if (!sessionError && !data.session) {
            const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
            
            if (exchangeError) {
              throw exchangeError
            }
            
            if (!exchangeData.session) {
              throw new Error('No session returned after code exchange')
            }
            
            console.log('[Callback PKCE Fixed] Session established:', exchangeData.session.user?.email)
          }
          
          setStatus('Success! Redirecting...')
          
          // Small delay to ensure session is saved
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // Use window.location for a clean redirect
          window.location.href = next
          
        } catch (authError: any) {
          console.error('[Callback PKCE Fixed] Auth error:', authError)
          
          if (authError.message?.includes('verifier')) {
            setError('Authentication session expired. Please sign in again.')
          } else {
            setError(authError.message || 'Authentication failed')
          }
          
          setTimeout(() => {
            // Clear any partial auth state and redirect
            localStorage.removeItem(`sb-${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split('.')[0]}-auth-token`)
            router.push(`${next}?error=auth_failed`)
          }, 3000)
        }
        
      } catch (err: any) {
        console.error('[Callback PKCE Fixed] Unexpected error:', err)
        setError('An unexpected error occurred')
        setTimeout(() => router.push('/en?error=unexpected'), 2000)
      }
    }
    
    handleCallback()
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {error ? 'Authentication Error' : 'Completing Sign In'}
        </h2>
        
        {error ? (
          <div className="text-red-600 mb-4">{error}</div>
        ) : (
          <>
            <p className="text-gray-600 mb-4">{status}</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </>
        )}
      </div>
    </div>
  )
}