import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // Create an HTML page that communicates with the parent window
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authenticating...</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            backdrop-filter: blur(10px);
          }
          .spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .error {
            color: #ff6b6b;
            background: rgba(255, 107, 107, 0.1);
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${error ? `
            <h2>Authentication Failed</h2>
            <div class="error">
              <p>${error_description || 'An error occurred during authentication'}</p>
            </div>
            <p style="margin-top: 1rem;">This window will close automatically...</p>
          ` : `
            <div class="spinner"></div>
            <h2>Authenticating...</h2>
            <p>Please wait while we complete your sign in.</p>
          `}
        </div>
        <script>
          // Track if auth is complete
          window.authComplete = false;

          ${error ? `
            // Send error message to parent window
            if (window.opener) {
              window.opener.postMessage({
                type: 'oauth-error',
                error: '${error_description || error}'
              }, '${searchParams.get('origin') || '*'}');
            }
            // Show message about manual close (COOP prevents auto-close)
            setTimeout(() => {
              document.querySelector('.container').innerHTML = '<h3>Authentication complete!</h3><p>You can close this window.</p>';
            }, 2000);
          ` : `
            // Process successful authentication
            async function handleCallback() {
              const params = new URLSearchParams(window.location.search);
              const code = params.get('code');
              
              if (code && window.opener) {
                try {
                  // Exchange code for session via parent window's API
                  const response = await fetch('/api/auth/exchange-code', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code })
                  });

                  if (response.ok) {
                    const data = await response.json();
                    // Mark auth as complete
                    window.authComplete = true;
                    // Send success message to parent window
                    if (window.opener) {
                      window.opener.postMessage({
                        type: 'oauth-success',
                        payload: data
                      }, '${searchParams.get('origin') || '*'}');
                    }
                    // Update UI to show success
                    document.querySelector('.container').innerHTML = '<h3>Sign in successful!</h3><p>You can close this window now.</p>';
                  } else {
                    const error = await response.text();
                    throw new Error(error || 'Failed to exchange code');
                  }
                } catch (error) {
                  console.error('OAuth error:', error);
                  if (window.opener) {
                    window.opener.postMessage({
                      type: 'oauth-error',
                      error: error.message
                    }, '${searchParams.get('origin') || '*'}');
                  }
                  // Update UI to show error
                  document.querySelector('.container').innerHTML = '<h3>Authentication Failed</h3><div class="error"><p>' + error.message + '</p></div><p>You can close this window.</p>';
              }
            }
            
            handleCallback();
          `}
        </script>
      </body>
    </html>
  `

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  })
}