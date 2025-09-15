export default function TestNoAuthPage() {
  return (
    <html>
      <body>
        <div style={{ padding: '2rem' }}>
          <h1>Test Page - No Auth</h1>
          <p>This page bypasses all providers and auth context.</p>
          <p>If you can see this, the basic Next.js routing works.</p>
        </div>
      </body>
    </html>
  )
}