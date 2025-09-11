'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function TestOAuthPage() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">OAuth Test Page</h1>
        
        {loading ? (
          <p>Loading auth state...</p>
        ) : user ? (
          <div className="space-y-4">
            <p className="text-green-600">✓ Signed in successfully!</p>
            <div className="bg-gray-100 p-4 rounded">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Provider:</strong> {user.app_metadata?.provider || 'N/A'}</p>
            </div>
            <Button onClick={signOut} variant="outline" className="w-full">
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">Not signed in</p>
            <Button onClick={signInWithGoogle} className="w-full">
              Sign in with Google
            </Button>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-blue-50 rounded text-sm">
          <p className="font-semibold mb-2">Debug Info:</p>
          <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
          <p>Auth State: {loading ? 'Loading...' : user ? 'Authenticated' : 'Not Authenticated'}</p>
        </div>
      </Card>
    </div>
  )
}