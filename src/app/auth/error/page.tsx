'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const errorCode = searchParams.get('error_code')
  
  useEffect(() => {
    console.error('[Auth Error Page] OAuth error:', {
      error,
      errorDescription,
      errorCode,
      allParams: Object.fromEntries(searchParams.entries())
    })
  }, [error, errorDescription, errorCode, searchParams])
  
  const getErrorMessage = () => {
    if (errorDescription) return errorDescription
    
    switch (error) {
      case 'access_denied':
        return 'You denied access to your account. Please try again if you want to sign in.'
      case 'unauthorized_client':
        return 'This application is not authorized. Please contact support.'
      case 'invalid_request':
        return 'The authentication request was invalid. Please try again.'
      case 'server_error':
        return 'The authentication server encountered an error. Please try again later.'
      case 'temporarily_unavailable':
        return 'The authentication service is temporarily unavailable. Please try again later.'
      default:
        return errorDescription || 'An error occurred during authentication. Please try again.'
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full bg-red-100 p-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h1>
          
          <p className="text-gray-600 mb-6">
            {getErrorMessage()}
          </p>
          
          {error && (
            <p className="text-sm text-gray-500 mb-6">
              Error code: {error}
            </p>
          )}
          
          <div className="flex gap-3">
            <Button
              onClick={() => router.push('/en')}
              variant="outline"
            >
              Go to Home
            </Button>
            
            <Button
              onClick={() => router.push('/en?auth=true')}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading error details...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}