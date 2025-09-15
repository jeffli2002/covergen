export default function TestSimplePage() {
  console.log('[TestSimplePage] Rendering')
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f3f4f6' 
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '32px', 
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        maxWidth: '28rem',
        width: '100%'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          Simple Test Page
        </h1>
        <p style={{ color: '#4b5563' }}>
          This is a server component with no client-side code.
        </p>
        <p style={{ marginTop: '16px', color: '#10b981' }}>
          If you see this, server rendering is working.
        </p>
      </div>
    </div>
  )
}