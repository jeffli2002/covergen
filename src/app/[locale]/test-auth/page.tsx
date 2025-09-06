'use client'

import { useAuth } from '@/hooks/useAuth'
import { WorkingAuthButton } from '@/components/auth/WorkingAuthButton'
import { UnifiedAuthButton } from '@/components/auth/UnifiedAuthButton'

export default function TestAuthPage() {
  const { user, loading } = useAuth()
  const isAuthenticated = !!user

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold text-center">Auth Test Page</h1>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Auth Status:</h2>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          {user && (
            <>
              <p>User ID: {user.id}</p>
              <p>Email: {user.email || 'N/A'}</p>
            </>
          )}
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Current Implementation:</p>
            <WorkingAuthButton />
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-2">Unified Auth (New):</p>
            <UnifiedAuthButton />
          </div>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>This page tests the auth system with API fallback</p>
          <p>to work around Supabase client hanging on Vercel</p>
        </div>
      </div>
    </div>
  )
}