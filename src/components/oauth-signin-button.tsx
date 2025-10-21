'use client'

import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { persistOAuthRedirect } from '@/lib/supabase-oauth-config'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface OAuthSignInButtonProps {
  provider: 'google'
  redirectTo?: string
  className?: string
  children: React.ReactNode
}

export function OAuthSignInButton({ 
  provider, 
  redirectTo = '/en',
  className,
  children 
}: OAuthSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleOAuthSignIn = async () => {
    if (!supabase) {
      console.error('Supabase client not initialized')
      return
    }

    try {
      setIsLoading(true)
      persistOAuthRedirect(redirectTo)
      
      // Use client-side OAuth which properly handles PKCE
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          // Don't specify queryParams to use default flow
        }
      })

      if (error) {
        console.error('OAuth error:', error)
        alert(`Authentication error: ${error.message}`)
      }
      // If successful, the browser will redirect to Google
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleOAuthSignIn}
      disabled={isLoading}
      className={className}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}
