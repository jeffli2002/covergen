'use client'

import { Suspense } from 'react'

interface ClientBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ClientBoundary({ children, fallback = null }: ClientBoundaryProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>
}