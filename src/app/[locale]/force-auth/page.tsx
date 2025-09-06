'use client'

import { useEffect, useState } from 'react'
import { createSimpleClient } from '@/lib/supabase/simple-client'
import { useRouter } from 'next/navigation'

export default function ForceAuthPage() {
  const [status, setStatus] = useState('Checking...')
  const [details, setDetails] = useState<any>(null)
  const router = useRouter()
  
  useEffect(() => {
    async function forceAuth() {
      try {
        // First try manual API check
        setStatus('Checking authentication via API...')
        const apiResponse = await fetch('/api/auth/verify')
        const apiData = await apiResponse.json()
        
        if (apiData.authenticated && apiData.user) {
          setStatus(`Authenticated! User: ${apiData.user.email || apiData.user.id}`)
          setDetails(apiData)
          
          setTimeout(() => {
            router.push('/en')
          }, 2000)
          return
        }
        
        setStatus('API check failed, trying Supabase client with timeout...')
        
        // Try client with aggressive timeout
        const supabase = createSimpleClient()
        
        const result = await Promise.race([
          supabase.auth.getUser(),
          new Promise<{ data: { user: null }, error: Error }>((resolve) => 
            setTimeout(() => resolve({ 
              data: { user: null }, 
              error: new Error('Client timeout after 3 seconds') 
            }), 3000)
          )
        ])
        
        const { data: { user }, error: userError } = result
        
        let session = null
        let error = userError
        
        if (user && !userError) {
          // User exists, try to get the full session
          setStatus('User found, attempting to get session...')
          try {
            // Try with a very short timeout since we know user exists
            const result = await Promise.race([
              supabase.auth.getSession(),
              new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('getSession timeout')), 1000)
              )
            ])
            session = result.data.session
          } catch (err) {
            // If getSession times out, manually construct from localStorage
            setStatus('getSession timed out, checking localStorage...')
            const storageKey = 'sb-exungkcoaihcemcmhqdr-auth-token'
            const stored = localStorage.getItem(storageKey)
            if (stored) {
              const sessionData = JSON.parse(stored)
              session = {
                access_token: sessionData.access_token,
                refresh_token: sessionData.refresh_token,
                user: user
              } as any
            }
          }
        }
        
        if (userError) {
          setStatus(`Client error: ${userError.message}`)
          setDetails({ error: userError.message })
        } else if (user) {
          setStatus(`User found via client! Email: ${user.email}`)
          setDetails({ user })
          
          setTimeout(() => {
            router.push('/en')
          }, 2000)
        } else {
          setStatus('No user found via client')
          
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
      <div className="text-center max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Force Auth Check</h1>
        <p className="text-lg mb-4">{status}</p>
        {details && (
          <pre className="text-left bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(details, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}