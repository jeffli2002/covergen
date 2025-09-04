'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestOAuthDebug() {
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  
  const testGoogleOAuth = async () => {
    try {
      setStatus('Starting Google OAuth...')
      setError('')
      
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const redirectUrl = `${siteUrl}/auth/callback?next=/en`
      
      console.log('Site URL:', siteUrl)
      console.log('Redirect URL:', redirectUrl)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (error) {
        setError(error.message)
        console.error('OAuth error:', error)
      } else {
        setStatus('OAuth initiated successfully!')
        console.log('OAuth data:', data)
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Unexpected error:', err)
    }
  }
  
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Current session:', session)
    setStatus(session ? `Logged in as: ${session.user.email}` : 'Not logged in')
  }
  
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">OAuth Debug Page</h1>
      
      <div className="space-y-4 max-w-2xl">
        <div className="p-4 bg-gray-100 rounded">
          <p><strong>Site URL:</strong> {process.env.NEXT_PUBLIC_SITE_URL || 'Not set (using window.location.origin)'}</p>
          <p><strong>Current Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'SSR'}</p>
          <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
        </div>
        
        <div className="space-x-4">
          <button 
            onClick={testGoogleOAuth}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Google OAuth
          </button>
          
          <button 
            onClick={checkSession}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Check Session
          </button>
        </div>
        
        {status && (
          <div className="p-4 bg-green-100 text-green-800 rounded">
            {status}
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-100 text-red-800 rounded">
            {error}
          </div>
        )}
        
        <div className="p-4 bg-yellow-100 rounded">
          <h2 className="font-bold mb-2">Required Supabase OAuth Settings:</h2>
          <p className="mb-2">Add these URLs to your Supabase project's Authentication → URL Configuration:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Site URL:</strong> http://localhost:3001</li>
            <li><strong>Redirect URLs:</strong></li>
            <ul className="list-disc pl-5">
              <li>http://localhost:3001/auth/callback</li>
              <li>http://localhost:3000/auth/callback (if you switch ports)</li>
            </ul>
          </ul>
          <p className="mt-2 text-sm">Go to: <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/project/default/auth/url-configuration`} target="_blank" className="text-blue-600 underline">Supabase Dashboard → Authentication → URL Configuration</a></p>
        </div>
      </div>
    </div>
  )
}