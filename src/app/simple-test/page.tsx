'use client'

export default function SimpleTestPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Simple OAuth Test</h1>
      <p>If you can see this, the server is working!</p>
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h2>Environment Check:</h2>
        <ul>
          <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set'}</li>
          <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}</li>
          <li>NEXT_PUBLIC_SITE_URL: {process.env.NEXT_PUBLIC_SITE_URL || 'Not set'}</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <button 
          onClick={() => {
            alert('Button works! Environment vars:\n' + 
              'URL: ' + (process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set') + '\n' +
              'Key: ' + (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'))
          }}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#0070f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Environment Variables
        </button>
      </div>
    </div>
  )
}