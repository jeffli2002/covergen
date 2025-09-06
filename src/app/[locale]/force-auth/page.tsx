'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function ForceAuthPage() {
  const [status, setStatus] = useState('Checking...')
  const router = useRouter()
  
  useEffect(() => {
    async function forceAuth() {
      try {
        setStatus('Creating Supabase client...')
        const supabase = createClient()
        
        setStatus('Getting session from client...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          setStatus(`Error: ${error.message}`)
          return
        }
        
        if (session) {
          setStatus(`Session found! User: ${session.user.email}. Redirecting...`)
          
          // Force auth state update
          await supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token
          })
          
          setTimeout(() => {
            router.push('/en')
          }, 2000)
        } else {
          setStatus('No session found in Supabase client')
          
          // Try to manually restore from localStorage
          const storageKey = 'sb-exungkcoaihcemcmhqdr-auth-token'
          const stored = localStorage.getItem(storageKey)
          
          if (stored) {
            setStatus('Found session in localStorage, attempting manual restore...')
            const sessionData = JSON.parse(stored)
            
            const { data, error: setError } = await supabase.auth.setSession({
              access_token: sessionData.access_token,
              refresh_token: sessionData.refresh_token
            })
            
            if (setError) {
              setStatus(`Manual restore error: ${setError.message}`)
            } else if (data.session) {
              setStatus(`Manual restore successful! User: ${data.session.user.email}. Redirecting...`)
              setTimeout(() => {
                router.push('/en')
              }, 2000)
            }
          }
        }
      } catch (err) {
        setStatus(`Exception: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    
    forceAuth()
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Force Auth Check</h1>
        <p className="text-lg">{status}</p>
      </div>
    </div>
  )
}