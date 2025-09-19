import { signInWithGoogleAction } from '@/app/actions/auth'

export default function TestServerOAuthSimplePage() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Server-Side OAuth Test (Implicit Flow)</h1>
      
      <div className="bg-blue-50 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">How this works:</h2>
        <ul className="space-y-1">
          <li>• Uses server action with implicit OAuth flow (no PKCE)</li>
          <li>• Matches the next-supabase-stripe-starter approach</li>
          <li>• No code verifier needed</li>
          <li>• Simpler callback handling</li>
        </ul>
      </div>

      <form>
        <button
          formAction={async () => {
            'use server'
            await signInWithGoogleAction('/test-server-oauth-simple')
          }}
          className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
        >
          Sign in with Google (Server Action)
        </button>
      </form>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <p className="text-sm">
          This approach uses the default OAuth flow without PKCE, which works 
          better with server-side implementations. The code verifier is not 
          needed in this flow.
        </p>
      </div>
    </div>
  )
}