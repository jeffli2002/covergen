'use client'

export default function DebugOAuthConfig() {
  const checkOAuthConfig = () => {
    const origin = window.location.origin
    const redirectUri = `${origin}/api/auth/callback/google`
    
    console.log('Current origin:', origin)
    console.log('Redirect URI that will be sent:', redirectUri)
    
    alert(`OAuth Redirect URI: ${redirectUri}`)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">OAuth Configuration Debug</h1>
      
      <div className="space-y-4">
        <div>
          <p className="font-semibold">Current URL:</p>
          <code className="bg-gray-100 p-2 block">{typeof window !== 'undefined' ? window.location.href : 'Loading...'}</code>
        </div>
        
        <div>
          <p className="font-semibold">Expected Redirect URI:</p>
          <code className="bg-gray-100 p-2 block">
            {typeof window !== 'undefined' ? `${window.location.origin}/api/auth/callback/google` : 'Loading...'}
          </code>
        </div>
        
        <div>
          <p className="font-semibold">Google Client ID:</p>
          <code className="bg-gray-100 p-2 block">697076616854-vklbkdfnpghk40tferj7fgkl955j50uh.apps.googleusercontent.com</code>
        </div>
        
        <button
          onClick={checkOAuthConfig}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Check OAuth Config
        </button>
        
        <button
          onClick={() => window.location.href = '/api/auth/oauth/google'}
          className="bg-green-500 text-white px-4 py-2 rounded ml-4"
        >
          Test Google OAuth
        </button>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Troubleshooting Steps:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Verify the redirect URI above matches exactly what's in Google Cloud Console</li>
          <li>Check for any trailing slashes or protocol differences (http vs https)</li>
          <li>Ensure the Client ID matches</li>
          <li>Clear browser cookies and cache</li>
          <li>Try in an incognito window</li>
        </ol>
      </div>
    </div>
  )
}