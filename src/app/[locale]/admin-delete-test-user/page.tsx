'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function AdminDeleteTestUserPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const deleteTestUser = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/admin/delete-test-user?email=994235892@qq.com', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to delete user')
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Admin: Delete Test User</h1>
      
      <Card className="p-6">
        <p className="mb-4">
          This will delete the test user account: <strong>994235892@qq.com</strong>
        </p>
        
        <Button 
          onClick={deleteTestUser}
          disabled={loading}
          variant="destructive"
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Deleting user...
            </>
          ) : (
            'Delete Test User 994235892@qq.com'
          )}
        </Button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700 font-semibold">Error:</p>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-700 font-semibold">Success!</p>
            <pre className="mt-2 text-sm text-green-600 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    </div>
  )
}