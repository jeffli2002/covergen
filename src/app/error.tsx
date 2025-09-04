'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 p-8">
        <h2 className="text-3xl font-bold text-gray-900">Something went wrong!</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          We encountered an error while loading this page.
        </p>
        <button
          onClick={() => reset()}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}