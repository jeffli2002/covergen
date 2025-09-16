'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function EmailConfirmPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Check URL parameters from Supabase email confirmation
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    const type = searchParams.get('type')
    
    // Supabase sends different parameters based on the confirmation result
    if (error) {
      setStatus('error')
      setMessage(errorDescription || 'Email confirmation failed. Please try again.')
    } else if (type === 'email') {
      // Successful email confirmation
      setStatus('success')
      setMessage('Email confirmed successfully! You can now sign in to your account.')
    } else {
      // If we're on this page without parameters, assume success
      // (Supabase sometimes redirects without explicit parameters on success)
      setStatus('success')
      setMessage('Email confirmed! You can now sign in to your account.')
    }
  }, [searchParams])

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-50 to-blue-50">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Email Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 mx-auto animate-spin text-blue-500" />
              <p className="text-lg text-gray-600">Processing your email confirmation...</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <div className="space-y-2">
                <p className="text-lg font-semibold text-green-600">{message}</p>
                <p className="text-sm text-gray-500">
                  Your account is now active and ready to use.
                </p>
              </div>
              <Link href="/en">
                <Button size="lg" className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  Go to Sign In
                </Button>
              </Link>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 mx-auto text-red-500" />
              <div className="space-y-2">
                <p className="text-lg font-semibold text-red-600">Confirmation Failed</p>
                <p className="text-sm text-gray-600">{message}</p>
              </div>
              <div className="space-y-3 mt-4">
                <p className="text-sm text-gray-500">
                  The confirmation link may have expired or already been used.
                </p>
                <Link href="/en">
                  <Button variant="outline" size="lg" className="w-full">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}