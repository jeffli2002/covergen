'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AuthSuccessPage() {
  const [user, setUser] = useState<any>(null)
  
  useEffect(() => {
    checkAuth()
  }, [])
  
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      setUser(session.user)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h1>
          
          {user && (
            <p className="text-gray-600 mb-6">
              You're signed in as {user.email}
            </p>
          )}
          
          <div className="space-y-3">
            <Link href="/en" className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
              Go to Homepage
            </Link>
            
            <Link href="/en/platforms" className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition">
              Create Cover Image
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-gray-500">
            The homepage might take a moment to load due to performance optimizations in progress.
          </p>
        </div>
      </div>
    </div>
  )
}