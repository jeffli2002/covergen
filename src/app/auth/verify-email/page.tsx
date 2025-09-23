'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  
  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided')
      return
    }
    
    // Verify the token
    verifyEmail(token)
  }, [token])
  
  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`/api/bestauth/verify-email?token=${verificationToken}`)
      const data = await response.json()
      
      if (response.ok && data.success) {
        setStatus('success')
        setMessage(data.message || 'Email verified successfully!')
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/?verified=true')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to verify email')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred while verifying your email')
    }
  }
  
  const resendVerification = async (email: string) => {
    try {
      const response = await fetch('/api/bestauth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setMessage('Verification email sent! Check your inbox.')
      } else {
        setMessage(data.error || 'Failed to send verification email')
      }
    } catch (error) {
      setMessage('Failed to send verification email')
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center py-12">
      <div className="container max-w-md mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              {status === 'loading' ? (
                <div className="p-4 bg-blue-100 rounded-full">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
              ) : status === 'success' ? (
                <div className="p-4 bg-green-100 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              ) : (
                <div className="p-4 bg-red-100 rounded-full">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
              )}
            </div>
            
            <CardTitle className="text-2xl">
              {status === 'loading' ? 'Verifying Email' : status === 'success' ? 'Email Verified!' : 'Verification Failed'}
            </CardTitle>
            
            <CardDescription className="text-base mt-2">
              {message}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            {status === 'success' && (
              <p className="text-gray-600">
                Redirecting you to the homepage...
              </p>
            )}
            
            {status === 'error' && (
              <>
                <p className="text-gray-600">
                  The verification link may have expired or already been used.
                </p>
                
                <div className="pt-4">
                  <Button
                    onClick={() => router.push('/')}
                    className="w-full"
                  >
                    Go to Homepage
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {status === 'error' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Need a new verification email?
            </p>
            <Button
              variant="link"
              onClick={() => {
                const email = prompt('Enter your email address:')
                if (email) {
                  resendVerification(email)
                }
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              <Mail className="w-4 h-4 mr-2" />
              Resend Verification Email
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}