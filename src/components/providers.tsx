'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { SupabaseAuthHandler } from '@/components/auth/SupabaseAuthHandler'
import { OAuthStateHandler } from '@/components/auth/OAuthStateHandler'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SupabaseAuthHandler>
        <OAuthStateHandler />
        {children}
        <Toaster position="bottom-right" />
      </SupabaseAuthHandler>
    </AuthProvider>
  )
}