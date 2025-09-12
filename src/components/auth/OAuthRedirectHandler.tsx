'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function OAuthRedirectHandler() {
  const router = useRouter()

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Check if we're on production domain with OAuth code
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    const error = url.searchParams.get('error')
    
    // If we're on production domain but should be on localhost (dev mode)
    const isProductionDomain = window.location.hostname === 'covergen.pro' || 
                               window.location.hostname === 'www.covergen.pro'
    const shouldBeLocalhost = localStorage.getItem('dev_mode') === 'true' ||
                             document.cookie.includes('dev_mode=true')

    if (isProductionDomain && shouldBeLocalhost && (code || error)) {
      console.log('[OAuth Redirect] Redirecting from production to localhost...')
      
      // Build localhost URL with all params
      const localUrl = new URL('http://localhost:3001' + window.location.pathname)
      url.searchParams.forEach((value, key) => {
        localUrl.searchParams.append(key, value)
      })
      
      // Redirect to localhost
      window.location.href = localUrl.toString()
      return
    }

    // Set dev mode flag when on localhost
    if (window.location.hostname === 'localhost') {
      localStorage.setItem('dev_mode', 'true')
      document.cookie = 'dev_mode=true; path=/; max-age=86400' // 24 hours
    }
  }, [router])

  return null
}