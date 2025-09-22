// Simple Sign In Page - OAuth Success Handler
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function SimpleSignInPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if we have a session after OAuth
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          // Redirect to dashboard after a moment
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        }
        setChecking(false)
      })
      .catch(() => {
        setChecking(false)
      })
  }, [router])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Checking authentication...</h2>
          <p className="text-muted-foreground">Please wait...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-green-600">OAuth Login Successful! 🎉</h2>
          <p className="text-lg">Welcome, {user.email || 'User'}!</p>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-3xl font-bold">Sign In</h1>
        <p className="text-muted-foreground">
          OAuth authentication completed. If you're not redirected automatically, click below.
        </p>
        <Button onClick={() => router.push('/dashboard')} className="w-full">
          Go to Dashboard
        </Button>
        <Button onClick={() => router.push('/test-bestauth')} variant="outline" className="w-full">
          Back to Test Page
        </Button>
      </div>
    </div>
  )
}