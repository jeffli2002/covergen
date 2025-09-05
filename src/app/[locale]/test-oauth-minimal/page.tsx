export default function TestOAuthMinimal() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">OAuth Test - Minimal</h1>
      <p className="mt-4">If you can see this page, the routing works!</p>
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold">Environment Check:</h2>
        <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}</p>
        <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</p>
      </div>
    </div>
  )
}