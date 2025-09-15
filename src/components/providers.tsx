'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'sonner'
import { Suspense } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthProvider>
        {children}
        <Toaster position="bottom-right" />
      </AuthProvider>
    </Suspense>
  )
}