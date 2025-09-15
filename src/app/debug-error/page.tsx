export default function DebugErrorPage() {
  return (
    <html>
      <head>
        <title>Debug Error</title>
      </head>
      <body>
        <div style={{ padding: '2rem' }}>
          <h1>Debug Error Page</h1>
          <p>If you see this, the basic app router works.</p>
          <h2>Test Links:</h2>
          <ul>
            <li><a href="/test-standalone">Test Standalone (works)</a></li>
            <li><a href="/en/test-basic">Test Basic with Locale</a></li>
            <li><a href="/en">Home with Locale</a></li>
          </ul>
          <h2>Environment:</h2>
          <pre>{JSON.stringify({
            NODE_ENV: process.env.NODE_ENV,
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
          }, null, 2)}</pre>
        </div>
      </body>
    </html>
  )
}