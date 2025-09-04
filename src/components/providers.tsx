'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { SupabaseAuthHandler } from '@/components/auth/SupabaseAuthHandler'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SupabaseAuthHandler>
        {children}
      </SupabaseAuthHandler>
    </AuthProvider>
  )
}