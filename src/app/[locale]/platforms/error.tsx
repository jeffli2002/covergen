'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function PlatformsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Platforms error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 p-8">
        <h2 className="text-3xl font-bold text-gray-900">Platform Loading Error</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          We encountered an error while loading this platform page. Please try again.
        </p>
        <Button
          onClick={() => reset()}
          className="mt-4"
        >
          Try again
        </Button>
      </div>
    </div>
  )
}