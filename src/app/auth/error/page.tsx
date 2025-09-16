'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason')
  const message = searchParams.get('message')
  const error = searchParams.get('error')

  const getErrorMessage = () => {
    switch (reason) {
      case 'provider':
        return `OAuth provider error: ${error || 'Unknown error'}`
      case 'exchange':
        return `Failed to exchange code: ${message || 'Unknown error'}`
      case 'no_code':
        return 'No authorization code received from OAuth provider'
      default:
        return 'There was an error signing you in. Please try again.'
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-4">
          {getErrorMessage()}
        </p>
        {(message || error) && (
          <div className="bg-red-50 p-4 rounded-lg mb-4 text-left">
            <p className="text-sm text-red-800 font-mono">{message || error}</p>
          </div>
        )}
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Return to Home
        </a>
      </div>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  )
}