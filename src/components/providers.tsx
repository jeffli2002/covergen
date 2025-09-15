'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="bottom-right" />
    </AuthProvider>
  )
}