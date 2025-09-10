import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // Get the parent origin from environment or use the request origin
  const PARENT_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const state = searchParams.get('state')

  console.log('[Auth Popup Callback] Processing OAuth callback:', {
    hasCode: !!code,
    hasError: !!error,
    error,
    parentOrigin: PARENT_ORIGIN
  })

  let sessionData = null
  let sessionError = null

  // If we have a code, exchange it for a session
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
        sessionError = exchangeError.message
      } else {
        console.log('[Auth Popup Callback] Code exchange successful:', {
          user: data?.session?.user?.email,
          hasSession: !!data?.session
        })
        sessionData = {
          user: data?.session?.user,
          session: !!data?.session
        }
      }
    } catch (error: any) {
      console.error('[Auth Popup Callback] Unexpected error:', error)
      sessionError = 'An unexpected error occurred'
    }
  }

  // The HTML payload that posts message back to opener then closes (with fallback UI)
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Auth Complete</title>
    <style>
      body {
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
        padding: 24px;
      }
      .fallback {
        max-width: 540px;
        margin: 36px auto;
        text-align: center;
      }
      button {
        padding: 8px 14px;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <script>
      (function () {
        // replace with your expected parent origin
        const parentOrigin = '${PARENT_ORIGIN}';

        // parse URL params to forward a code or error to parent (do not send secrets)
        const params = new URLSearchParams(location.search);
        const payload = {
          type: 'oauth_result',
          code: params.get('code'),
          state: params.get('state'),
          error: ${error ? `'${error}'` : 'null'},
          errorDescription: ${errorDescription ? `'${errorDescription}'` : 'null'},
          sessionError: ${sessionError ? `'${sessionError}'` : 'null'},
          sessionData: ${sessionData ? JSON.stringify(sessionData) : 'null'}
        };

        function showFallback() {
          document.body.innerHTML = \`
            <div class="fallback">
              <h2>Authentication complete</h2>
              <p>If this window does not close automatically, please close it and return to the application.</p>
              <p><button id="closeBtn">Close window</button></p>
            </div>
          \`;
          document.getElementById('closeBtn').addEventListener('click', function () {
            try { window.close(); } catch (e) { /* ignore */ }
          });
        }

        try {
          // If opener exists and not closed, post message to parent and attempt close
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(payload, parentOrigin);
            // attempt to close the popup - will succeed if popup was opened with window.open and COOP allows it
            window.close();
            // Some browsers may block close() — show fallback after slight delay
            setTimeout(function () {
              if (!window.closed) showFallback();
            }, 300);
          } else {
            // opener missing or closed
            showFallback();
          }
        } catch (err) {
          // blocked by COOP or other cross-origin access errors
          console.error('popup postMessage/close failed', err);
          showFallback();
        }
      })();
    </script>
  </body>
</html>`;

  // Return the response with the key header to allow popups to keep opener
  const headers = new Headers({
    'Content-Type': 'text/html; charset=utf-8',
    // critical header to preserve opener for popups
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    // optionally tighten content security - adjust as needed
    'Content-Security-Policy': "default-src 'self' 'unsafe-inline' https: data:;",
  });

  return new Response(html, { status: 200, headers });
}