import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const PARENT_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
  
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  
  console.log('[Auth Popup Fix] Processing OAuth callback:', {
    hasCode: !!code,
    hasError: !!error,
    fullUrl: request.url
  })

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Completing authentication...</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .spinner {
      display: inline-block;
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    button {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    button:hover {
      background: #2980b9;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h2>Completing authentication...</h2>
    <p>Please wait while we complete your sign-in.</p>
    <button id="closeBtn" style="display: none;">Close Window</button>
  </div>
  
  <script>
    (function() {
      const parentOrigin = '${PARENT_ORIGIN}';
      const params = new URLSearchParams(location.search);
      
      const payload = {
        type: 'oauth_result',
        code: params.get('code'),
        state: params.get('state'),
        error: ${error ? `'${error}'` : 'null'},
        errorDescription: ${errorDescription ? `'${errorDescription}'` : 'null'},
        sessionError: null,
        sessionData: { success: true, message: 'Code received' }
      };
      
      console.log('[Popup] Opener exists:', !!window.opener);
      console.log('[Popup] Window name:', window.name);
      console.log('[Popup] Sending payload:', payload);
      
      function showFallback() {
        document.querySelector('.spinner').style.display = 'none';
        document.querySelector('h2').textContent = 'Authentication complete';
        document.querySelector('p').textContent = 'You can close this window and return to the application.';
        document.getElementById('closeBtn').style.display = 'inline-block';
      }
      
      document.getElementById('closeBtn').addEventListener('click', function() {
        window.close();
      });
      
      try {
        // Method 1: Try postMessage to opener
        if (window.opener && !window.opener.closed) {
          console.log('[Popup] Posting message to opener');
          window.opener.postMessage(payload, parentOrigin);
          
          // Try to close after a short delay
          setTimeout(() => {
            try {
              window.close();
              // If still open after 300ms, show fallback
              setTimeout(() => {
                if (!window.closed) showFallback();
              }, 300);
            } catch (e) {
              console.error('[Popup] Cannot close:', e);
              showFallback();
            }
          }, 100);
        } else {
          console.log('[Popup] No opener available, using localStorage fallback');
          // Method 2: Use localStorage as fallback
          localStorage.setItem('oauth_result', JSON.stringify(payload));
          showFallback();
        }
      } catch (err) {
        console.error('[Popup] Error:', err);
        // Fallback to localStorage
        try {
          localStorage.setItem('oauth_result', JSON.stringify(payload));
        } catch (e) {
          console.error('[Popup] Storage error:', e);
        }
        showFallback();
      }
    })();
  </script>
</body>
</html>`;

  // Return with proper headers to preserve opener
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'X-Frame-Options': 'SAMEORIGIN'
    }
  });
}