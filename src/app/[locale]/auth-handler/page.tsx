'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase-client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Processing authentication...')
  
  useEffect(() => {
    async function handleAuth() {
      console.log('[AuthHandler] Starting auth handling')
      console.log('[AuthHandler] URL:', window.location.href)
      
      // Check for tokens in hash (implicit flow)
      const hash = window.location.hash
      if (hash && hash.length > 1) {
        console.log('[AuthHandler] Found hash, processing implicit flow')
        setStatus('Processing authentication tokens...')
        
        // Parse hash parameters
        const hashParams = new URLSearchParams(hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const error = hashParams.get('error')
        
        if (error) {
          console.error('[AuthHandler] Error in hash:', error)
          setStatus(`Authentication error: ${error}`)
          setTimeout(() => router.push('/en'), 2000)
          return
        }
        
        if (accessToken) {
          console.log('[AuthHandler] Found access token, setting session')
          const supabase = createSupabaseClient()
          
          try {
            // Set the session with the tokens
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            })
            
            if (sessionError) {
              console.error('[AuthHandler] Error setting session:', sessionError)
              setStatus('Failed to set session')
              setTimeout(() => router.push('/en'), 2000)
              return
            }
            
            console.log('[AuthHandler] Session set successfully:', data.user?.email)
            setStatus('Authentication successful! Redirecting...')
            
            // Get redirect path
            const next = searchParams.get('next') || '/en/account'
            
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname + window.location.search)
            
            // Redirect
            setTimeout(() => router.push(next), 500)
          } catch (err) {
            console.error('[AuthHandler] Unexpected error:', err)
            setStatus('Authentication failed')
            setTimeout(() => router.push('/en'), 2000)
          }
          return
        }
      }
      
      // Check for code in search params (PKCE flow)
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      
      if (error) {
        console.error('[AuthHandler] Error in params:', error)
        setStatus(`Auth error: ${error}`)
        setTimeout(() => router.push('/en'), 2000)
        return
      }
      
      if (code) {
        console.log('[AuthHandler] Found code, waiting for server-side exchange')
        setStatus('Processing authentication code...')
        
        // Wait for server-side auth to complete
        setTimeout(async () => {
          const supabase = createSupabaseClient()
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            console.log('[AuthHandler] Session found:', session.user?.email)
            setStatus('Authentication successful! Redirecting...')
            const next = searchParams.get('next') || '/en/account'
            router.push(next)
          } else {
            console.log('[AuthHandler] No session found, retrying...')
            setStatus('Verifying authentication...')
            
            // Try once more
            setTimeout(async () => {
              const { data: { session: retrySession } } = await supabase.auth.getSession()
              if (retrySession) {
                console.log('[AuthHandler] Session found on retry:', retrySession.user?.email)
                setStatus('Session verified! Redirecting...')
                const next = searchParams.get('next') || '/en/account'
                router.push(next)
              } else {
                console.error('[AuthHandler] No session after retry')
                setStatus('Authentication failed. Redirecting...')
                setTimeout(() => router.push('/en'), 1000)
              }
            }, 2000)
          }
        }, 1000)
      } else {
        // No code or hash, check existing session
        console.log('[AuthHandler] No code or hash, checking existing session')
        const supabase = createSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          console.log('[AuthHandler] Already authenticated:', session.user?.email)
          setStatus('Already authenticated! Redirecting...')
          router.push('/en/account')
        } else {
          console.log('[AuthHandler] No authentication found')
          setStatus('No authentication found. Redirecting...')
          setTimeout(() => router.push('/en'), 1000)
        }
      }
    }
    
    handleAuth()
  }, [router, searchParams])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">{status}</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  )
}