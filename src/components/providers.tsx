'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { SimpleAuthHandler } from '@/components/auth/SimpleAuthHandler'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SimpleAuthHandler />
      {children}
      <Toaster position="bottom-right" />
    </AuthProvider>
  )
}