'use client'

import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

function AuthExchangeContent() {
  const [status, setStatus] = useState<'idle' | 'exchanging' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string>('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get('code')

  const exchangeCode = async () => {
    if (!code) {
      setError('No code provided')
      return
    }

    setStatus('exchanging')
    console.log('[Auth Exchange] Starting manual code exchange:', code)

    try {
      const supabase = createClient()
      
      // Try to exchange the code
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('[Auth Exchange] Exchange error:', exchangeError)
        setError(exchangeError.message)
        setStatus('error')
        return
      }

      if (!data?.session) {
        console.error('[Auth Exchange] No session returned')
        setError('No session returned from exchange')
        setStatus('error')
        return
      }

      console.log('[Auth Exchange] Success!', {
        user: data.session.user.email,
        userId: data.session.user.id,
        expiresAt: data.session.expires_at
      })

      setStatus('success')
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/en?auth_callback=success')
      }, 1000)
      
    } catch (err: any) {
      console.error('[Auth Exchange] Unexpected error:', err)
      setError(err.message || String(err))
      setStatus('error')
    }
  }

  useEffect(() => {
    // Show current state
    console.log('[Auth Exchange] Page loaded:', {
      code: code?.substring(0, 20) + '...',
      cookies: document.cookie,
      localStorage: Object.keys(localStorage).filter(k => k.includes('supabase'))
    })
  }, [code])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Manual OAuth Code Exchange</h1>
        
        {!code ? (
          <div className="text-red-600">
            <p>No OAuth code found in URL</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-sm text-gray-600">OAuth Code:</p>
              <p className="text-xs font-mono break-all">{code}</p>
            </div>

            {status === 'idle' && (
              <Button 
                onClick={exchangeCode}
                className="w-full"
              >
                Exchange Code for Session
              </Button>
            )}

            {status === 'exchanging' && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p>Exchanging code...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-green-600 text-center">
                <p className="text-2xl mb-2">✅</p>
                <p>Success! Redirecting...</p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-red-600">
                <p className="font-bold mb-2">Exchange Failed</p>
                <p className="text-sm">{error}</p>
                <Button 
                  onClick={() => router.push('/en')}
                  variant="outline"
                  className="w-full mt-4"
                >
                  Go to Homepage
                </Button>
              </div>
            )}

            <div className="mt-6 space-y-2 text-sm text-gray-600">
              <p>Debug Info:</p>
              <ul className="text-xs space-y-1">
                <li>Time: {new Date().toISOString()}</li>
                <li>Origin: {window.location.origin}</li>
                <li>Cookies: {document.cookie.split('; ').length} total</li>
                <li>Auth cookies: {document.cookie.split('; ').filter(c => c.includes('sb-')).length}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AuthExchangePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AuthExchangeContent />
    </Suspense>
  )
}