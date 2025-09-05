import Link from 'next/link'

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { reason?: string }
}) {
  const reason = searchParams.reason || 'unknown'
  
  const errorMessages: Record<string, string> = {
    invalid_code: 'The authentication code was invalid or expired. Please try signing in again.',
    unknown: 'An unknown error occurred during authentication. Please try again.',
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {errorMessages[reason]}
          </p>
          <div className="mt-6 space-y-3">
            <Link
              href="/en/oauth-official-test"
              className="block w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Try Again
            </Link>
            <Link
              href="/en"
              className="block w-full rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}