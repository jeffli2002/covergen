'use client'

import { useEffect } from 'react'

export default function OAuthRedirect() {
  useEffect(() => {
    // Check if this is an OAuth callback
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const error = params.get('error')
    
    if (code || error) {
      // Redirect to auth handler
      window.location.href = `/en/auth-handler${window.location.search}`
    } else {
      // No OAuth params, go home
      window.location.href = '/en'
    }
  }, [])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  )
}