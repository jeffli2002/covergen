'use client'

import { BestAuthProvider } from '@/contexts/BestAuthContext'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <BestAuthProvider>{children}</BestAuthProvider>
}