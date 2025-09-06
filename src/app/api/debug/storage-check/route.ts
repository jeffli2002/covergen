import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Storage Check</title>
</head>
<body>
  <h1>Storage Check</h1>
  <pre id="results"></pre>
  
  <script>
    const storageKey = 'sb-exungkcoaihcemcmhqdr-auth-token';
    const stored = localStorage.getItem(storageKey);
    
    let data = {
      timestamp: new Date().toISOString(),
      hasStoredSession: !!stored,
      storedLength: stored?.length || 0
    };
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        data.parsed = {
          hasAccessToken: !!parsed.access_token,
          hasRefreshToken: !!parsed.refresh_token,
          hasUser: !!parsed.user,
          userEmail: parsed.user?.email,
          expiresAt: parsed.expires_at,
          expiresIn: parsed.expires_in,
          tokenType: parsed.token_type
        };
        
        // Check if expired
        if (parsed.expires_at) {
          const expiresAt = parsed.expires_at * 1000; // Convert to milliseconds
          const now = Date.now();
          data.parsed.isExpired = now > expiresAt;
          data.parsed.expiresInMinutes = Math.floor((expiresAt - now) / 1000 / 60);
        }
      } catch (e) {
        data.parseError = e.toString();
      }
    }
    
    // Also check for Supabase client
    if (window.Supabase) {
      data.hasSupabaseGlobal = true;
    }
    
    document.getElementById('results').textContent = JSON.stringify(data, null, 2);
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