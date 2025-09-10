import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const next = searchParams.get('next') ?? '/en'

  console.log('[Auth Popup Callback] Processing OAuth callback:', {
    hasCode: !!code,
    hasError: !!error,
    error,
    next,
    origin
  })

  // HTML template for popup callback handling
  const htmlTemplate = (success: boolean, data?: any, errorMsg?: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Completing Sign In...</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: #f5f5f5;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 400px;
          }
          .spinner {
            width: 40px;
            height: 40px;
            margin: 0 auto 1rem;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .error {
            color: #e74c3c;
            margin-top: 1rem;
          }
          .manual-close {
            margin-top: 1.5rem;
            color: #666;
            font-size: 0.9rem;
            display: none;
          }
          button {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
          }
          button:hover {
            background: #2980b9;
          }
          .success-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${success ? '<div class="spinner"></div>' : '<div class="success-icon">❌</div>'}
          <h2>${success ? 'Completing Sign In...' : 'Sign In Failed'}</h2>
          ${errorMsg ? `<p class="error">${errorMsg}</p>` : ''}
          <div class="manual-close">
            <p>If this window doesn't close automatically:</p>
            <button onclick="handleClose()">Close Window</button>
          </div>
        </div>
        <script>
          (function() {
            const parentOrigin = '${origin}';
            let closeFailed = false;
            
            // Resilient postMessage handler
            function sendMessageToParent() {
              try {
                if (window.opener && !window.opener.closed) {
                  window.opener.postMessage({
                    type: '${success ? 'oauth-success' : 'oauth-error'}',
                    ${success ? `payload: ${JSON.stringify(data)}` : `error: ${JSON.stringify(errorMsg || 'Authentication failed')}`}
                  }, parentOrigin);
                  return true;
                }
              } catch (err) {
                console.error('Failed to send message to parent:', err);
              }
              return false;
            }
            
            // Attempt to close window
            function attemptClose() {
              try {
                window.close();
                // Check if close worked after a delay
                setTimeout(() => {
                  // If we're still here, close didn't work
                  closeFailed = true;
                  showManualClose();
                }, 500);
              } catch (err) {
                console.error('window.close() failed:', err);
                closeFailed = true;
                showManualClose();
              }
            }
            
            // Show manual close UI
            function showManualClose() {
              const manualCloseDiv = document.querySelector('.manual-close');
              if (manualCloseDiv) {
                manualCloseDiv.style.display = 'block';
              }
              // Hide spinner if showing
              const spinner = document.querySelector('.spinner');
              if (spinner) {
                spinner.style.display = 'none';
              }
              // Update title if success
              if (${success}) {
                const title = document.querySelector('h2');
                if (title) {
                  title.textContent = 'Sign In Successful!';
                }
              }
            }
            
            // Handle close button click
            window.handleClose = function() {
              try {
                window.close();
              } catch (e) {
                // If close still fails, redirect to parent origin
                window.location.href = parentOrigin + '${next}';
              }
            }
            
            // Execute flow
            const messageSent = sendMessageToParent();
            
            // Attempt to close after a delay
            setTimeout(() => {
              attemptClose();
            }, ${success ? '1500' : '2500'});
            
            // Fallback: show manual close after longer delay if still open
            setTimeout(() => {
              if (!closeFailed) {
                showManualClose();
              }
            }, ${success ? '3000' : '4000'});
          })();
        </script>
      </body>
    </html>
  `;

  // Handle OAuth error
  if (error) {
    console.error('[Auth Popup Callback] OAuth error:', error)
    return new NextResponse(
      htmlTemplate(false, null, searchParams.get('error_description') || error),
      { 
        headers: { 
          'Content-Type': 'text/html',
          'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
        },
        status: 200 
      }
    )
  }

  if (code) {
    try {
      const cookieStore = cookies()
      
      // Create Supabase client with cookie handling
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              cookieStore.set({ name, value, ...options })
            },
            remove(name: string, options: CookieOptions) {
              cookieStore.set({ name, value: '', ...options })
            },
          },
        }
      )
      
      // Exchange code for session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('[Auth Popup Callback] Code exchange error:', exchangeError)
        return new NextResponse(
          htmlTemplate(false, null, exchangeError.message),
          { 
            headers: { 
              'Content-Type': 'text/html',
              'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
            },
            status: 200 
          }
        )
      }
      
      console.log('[Auth Popup Callback] Code exchange successful:', {
        user: data?.session?.user?.email,
        hasSession: !!data?.session
      })
      
      // Return success HTML
      return new NextResponse(
        htmlTemplate(true, {
          user: data?.session?.user,
          next
        }),
        { 
          headers: { 
            'Content-Type': 'text/html',
            'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
          },
          status: 200 
        }
      )
    } catch (error: any) {
      console.error('[Auth Popup Callback] Unexpected error:', error)
      return new NextResponse(
        htmlTemplate(false, null, 'An unexpected error occurred'),
        { 
          headers: { 
            'Content-Type': 'text/html',
            'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
          },
          status: 200 
        }
      )
    }
  }

  // No code in URL
  console.error('[Auth Popup Callback] No code in URL')
  return new NextResponse(
    htmlTemplate(false, null, 'No authorization code received'),
    { 
      headers: { 
        'Content-Type': 'text/html',
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
      },
      status: 200 
    }
  )
}