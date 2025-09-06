'use client'

import { useEffect, useState } from 'react'
import { useAuth as useAuthContext } from '@/contexts/AuthContext'
import { useAuth as useAuthHook } from '@/hooks/useAuth'

export function AuthStatusDebug() {
  const contextAuth = useAuthContext()
  const hookAuth = useAuthHook()
  const [apiStatus, setApiStatus] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/verify')
      .then(res => res.json())
      .then(data => setApiStatus(data))
      .catch(err => setApiStatus({ error: err.message }))
  }, [])

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm text-xs">
      <h3 className="font-bold mb-2">Auth Status Debug</h3>
      
      <div className="space-y-2">
        <div>
          <strong>API Direct:</strong>
          <pre className="text-xs bg-gray-100 p-1 rounded mt-1">
            {JSON.stringify(apiStatus, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>Auth Hook:</strong>
          <pre className="text-xs bg-gray-100 p-1 rounded mt-1">
            {JSON.stringify({
              user: hookAuth.user?.email,
              loading: hookAuth.loading,
              error: hookAuth.error
            }, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>Auth Context:</strong>
          <pre className="text-xs bg-gray-100 p-1 rounded mt-1">
            {JSON.stringify({
              user: contextAuth.user?.email,
              loading: contextAuth.loading,
              hasValidSubscription: contextAuth.hasValidSubscription
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}