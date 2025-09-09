'use client'

import dynamic from 'next/dynamic'

// Dynamically import the component to prevent SSR/SSG
const TestSessionCheckContent = dynamic(
  () => import('./test-session-check-content'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
)

export default function TestSessionCheck() {
  return <TestSessionCheckContent />
}