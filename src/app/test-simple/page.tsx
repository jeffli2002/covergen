'use client'

export default function TestSimplePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-3xl font-bold text-gray-900">Simple Test Page</h1>
        <p className="text-gray-600">
          This is a simple test page to verify the basic setup is working.
        </p>
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
          <div className="text-left space-y-2">
            <p><strong>Node Environment:</strong> {process.env.NODE_ENV || 'Not set'}</p>
            <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}</p>
            <p><strong>Supabase Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
