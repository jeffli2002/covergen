# Why Dev Mode Works with Server-Side Callback but Production Doesn't

## The Key Difference: OAuth Flow Types

### Your Current Setup
- **Flow Type**: `flowType: 'pkce'` (as seen in your `supabase-simple.ts`)
- **Dev Mode**: Works with server-side callback
- **Production**: Fails with server-side callback

### Why This Happens

#### 1. **PKCE Flow (What You're Using)**
When you use PKCE flow:
- OAuth provider returns an **authorization code** in URL query parameters (e.g., `?code=abc123`)
- This code CAN be read by server-side code
- Server exchanges the code for tokens using `exchangeCodeForSession()`
- **This is why it works in dev mode!**

#### 2. **Implicit Flow (Default in some Supabase setups)**
When using implicit flow:
- OAuth provider returns tokens in URL **fragment/hash** (e.g., `#access_token=xyz`)
- Server-side code CANNOT read URL fragments (browser security feature)
- Only client-side JavaScript can access the hash
- **This would explain why server-side doesn't work**

### But Why Does Production Fail?

The issue isn't actually about PKCE vs Implicit flow. The real problem is likely:

1. **Cookie Configuration**
   - Dev mode: Cookies work with `sameSite: 'lax'` and `secure: false`
   - Production: Requires `secure: true` for HTTPS
   - If cookies aren't set properly, the session isn't preserved after redirect

2. **Redirect URL Mismatch**
   - Dev: `http://localhost:3001/auth/callback`
   - Production: `https://covergen.app/auth/callback`
   - Even slight mismatches cause OAuth to fail

3. **Session Detection Timing**
   - In production, there might be a race condition where the server-side code tries to read the session before it's fully established
   - The client-side callback can handle this better with retries

### Why next-supabase-stripe-starter Works

The starter likely works because:

1. **Uses @supabase/ssr package properly**
   ```typescript
   // They use server client with proper cookie handling
   const supabase = createServerClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
     {
       cookies: {
         get(name: string) {
           return cookieStore.get(name)?.value
         },
         set(name: string, value: string, options: CookieOptions) {
           // Proper production cookie settings
           cookieStore.set({ name, value, ...options })
         },
         remove(name: string, options: CookieOptions) {
           cookieStore.set({ name, value: '', ...options })
         },
       },
     }
   )
   ```

2. **Consistent PKCE flow configuration**
   - PKCE is default in @supabase/ssr
   - No mixing of flow types

3. **Proper cookie configuration for production**
   - Handles secure cookies correctly
   - Sets proper SameSite attributes

## The Real Solution

### Option 1: Fix Server-Side Callback (Recommended if using PKCE)
```typescript
// /app/auth/callback/route.ts
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = cookies()
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
            cookieStore.delete(name)
          },
        },
      }
    )
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return to login page on error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
}
```

### Option 2: Use Client-Side Callback (Works for both flows)
The solution I provided earlier - handles both PKCE and implicit flows.

## Quick Debug Test

To confirm which flow you're actually using in production:

1. Try to sign in
2. When redirected back, check the URL:
   - If you see `?code=...` → PKCE flow (server-side should work)
   - If you see `#access_token=...` → Implicit flow (need client-side)

## Summary

Your dev mode works because:
- PKCE flow returns code in query params (server-readable)
- Local cookies work without strict security requirements

Production fails because:
- Cookie security requirements are stricter
- Possible redirect URL mismatches
- Session establishment timing issues

The client-side callback solution works for both flows and handles all edge cases, which is why it's the safer choice.