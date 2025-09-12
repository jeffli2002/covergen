'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function AuthHandler() {
  const router = useRouter()
  const [status, setStatus] = useState('Checking authentication...')
  
  useEffect(() => {
    async function handleAuth() {
      // Get URL params
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const error = params.get('error')
      
      if (error) {
        setStatus(`Auth error: ${error}`)
        setTimeout(() => router.push('/en'), 2000)
        return
      }
      
      if (code) {
        setStatus('Processing authentication...')
        
        // Just wait a bit for server-side auth to complete
        setTimeout(async () => {
          const supabase = createSupabaseClient()
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            setStatus('Authentication successful! Redirecting...')
            router.push('/en')
          } else {
            setStatus('Session not found, retrying...')
            // Try once more after another delay
            setTimeout(async () => {
              const { data: { session: retrySession } } = await supabase.auth.getSession()
              if (retrySession) {
                setStatus('Session found! Redirecting...')
                router.push('/en')
              } else {
                setStatus('Authentication failed. Redirecting...')
                setTimeout(() => router.push('/en'), 1000)
              }
            }, 2000)
          }
        }, 1000)
      } else {
        // Check if we already have a session
        const supabase = createSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setStatus('Already authenticated! Redirecting...')
          router.push('/en')
        } else {
          setStatus('No authentication found. Redirecting...')
          setTimeout(() => router.push('/en'), 1000)
        }
      }
    }
    
    handleAuth()
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">{status}</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  )
}