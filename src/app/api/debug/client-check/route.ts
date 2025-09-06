import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // This endpoint returns a simple HTML page that checks client-side session
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Client Session Check</title>
</head>
<body>
  <h1>Client Session Check</h1>
  <div id="status">Checking...</div>
  <pre id="results"></pre>
  
  <script>
    async function checkClientSession() {
      const status = document.getElementById('status');
      const results = document.getElementById('results');
      
      try {
        // Check cookies
        const cookies = document.cookie.split('; ').filter(c => 
          c.includes('sb-') || c.includes('auth')
        );
        
        // Check localStorage
        const localStorageKeys = Object.keys(localStorage).filter(k => 
          k.includes('sb-') || k.includes('supabase')
        );
        
        const data = {
          timestamp: new Date().toISOString(),
          cookies: cookies,
          cookieCount: cookies.length,
          localStorage: localStorageKeys,
          localStorageCount: localStorageKeys.length,
          hasAuthToken: cookies.some(c => c.includes('auth-token')),
          hasSessionData: cookies.some(c => c.includes('session-data'))
        };
        
        status.textContent = 'Results:';
        results.textContent = JSON.stringify(data, null, 2);
        
      } catch (error) {
        status.textContent = 'Error:';
        results.textContent = error.toString();
      }
    }
    
    checkClientSession();
  </script>
</body>
</html>
  `;
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}