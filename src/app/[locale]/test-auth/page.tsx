import { createSupabaseClient } from '@/lib/supabase/server'
import { checkAuthSession } from '@/app/actions/auth'

export default async function TestAuthPage() {
  // Server-side session check
  const supabase = await createSupabaseClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Server-Side Auth Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          {error ? (
            <p className="text-red-600">Error: {error.message}</p>
          ) : session ? (
            <div className="space-y-2">
              <p className="text-green-600 font-semibold">✓ Authenticated</p>
              <p><strong>User:</strong> {session.user.email}</p>
              <p><strong>ID:</strong> {session.user.id}</p>
              <p><strong>Provider:</strong> {session.user.app_metadata?.provider}</p>
            </div>
          ) : (
            <p className="text-gray-600">No session found</p>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <a 
              href="/en"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go Home
            </a>
            <a 
              href="/en/debug-auth"
              className="inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Debug Auth
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}