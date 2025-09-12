'use client'

import { useEffect } from 'react'

export default function OAuthRedirectFix() {
  useEffect(() => {
    // Get current URL params
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const error = params.get('error')
    
    if (code || error) {
      // Build localhost URL
      const localUrl = new URL('http://localhost:3001/auth/callback')
      params.forEach((value, key) => {
        localUrl.searchParams.append(key, value)
      })
      
      // Show message
      console.log('Redirecting to localhost...')
      
      // Redirect after brief delay
      setTimeout(() => {
        window.location.href = localUrl.toString()
      }, 100)
    }
  }, [])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to localhost...</h1>
        <p className="text-gray-600">
          If you're not redirected automatically, 
          <a 
            href="http://localhost:3001" 
            className="text-blue-600 underline ml-1"
          >
            click here
          </a>
        </p>
      </div>
    </div>
  )
}