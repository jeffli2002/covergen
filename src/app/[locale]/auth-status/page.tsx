'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AuthStatusPage() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()

  return (
    <div className="container mx-auto p-8">
      <Card className="p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Auth Status</h1>
        
        {loading ? (
          <p>Loading...</p>
        ) : user ? (
          <div>
            <p className="text-green-600 mb-4">✓ Authenticated</p>
            <p>Email: {user.email}</p>
            <p>ID: {user.id}</p>
            <Button onClick={signOut} className="mt-4">
              Sign Out
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-red-600 mb-4">✗ Not authenticated</p>
            <Button onClick={signInWithGoogle}>
              Sign in with Google
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}