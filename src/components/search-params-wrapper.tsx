'use client'

import { Suspense } from 'react'

interface SearchParamsWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function SearchParamsWrapper({ children, fallback = null }: SearchParamsWrapperProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>
}