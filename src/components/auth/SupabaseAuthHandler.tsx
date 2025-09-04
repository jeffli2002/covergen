'use client'

export function SupabaseAuthHandler({ children }: { children: React.ReactNode }) {
  // No longer handle OAuth callbacks here - they're handled by /auth/callback route
  return <>{children}</>
}