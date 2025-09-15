'use client'

import { useState } from 'react'

export default function TestSimpleOAuthPage() {
  const [status, setStatus] = useState('Not signed in')

  const handleGoogleSignIn = async () => {
    try {
      setStatus('Initiating OAuth...')
      // Direct form submission to trigger server action
      const form = document.createElement('form')
      form.action = '/api/auth/signin/google'
      form.method = 'POST'
      document.body.appendChild(form)
      form.submit()
    } catch (error) {
      setStatus(`Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Simple OAuth Test (No Locale)</h1>
        
        <p className="mb-4 text-gray-600">Status: {status}</p>
        
        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Sign in with Google
        </button>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>This page bypasses the locale routing to test OAuth directly.</p>
        </div>
      </div>
    </div>
  )
}