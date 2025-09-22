// BestAuth Test Page
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'

export default function TestBestAuthPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testSignUp = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test${Date.now()}@example.com`,
          password: 'testpassword123',
          name: 'Test User',
        }),
      })
      const data = await response.json()
      setResult({ type: 'signup', data, status: response.status })
    } catch (error) {
      setResult({ type: 'signup', error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }

  const testSignIn = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword123',
        }),
      })
      const data = await response.json()
      setResult({ type: 'signin', data, status: response.status })
    } catch (error) {
      setResult({ type: 'signin', error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }

  const testSession = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      setResult({ type: 'session', data, status: response.status })
    } catch (error) {
      setResult({ type: 'session', error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }

  const testSignOut = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      })
      const data = await response.json()
      setResult({ type: 'signout', data, status: response.status })
    } catch (error) {
      setResult({ type: 'signout', error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }

  const testGoogleOAuth = () => {
    window.location.href = '/api/auth/oauth/google'
  }

  const testGitHubOAuth = () => {
    window.location.href = '/api/auth/oauth/github'
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">BestAuth Test Page</h1>
      
      <div className="grid gap-4 mb-8">
        <Button onClick={testSignUp} disabled={loading}>
          Test Sign Up
        </Button>
        
        <Button onClick={testSignIn} disabled={loading}>
          Test Sign In
        </Button>
        
        <Button onClick={testSession} disabled={loading}>
          Test Session Check
        </Button>
        
        <Button onClick={testSignOut} disabled={loading}>
          Test Sign Out
        </Button>
        
        <Button onClick={testGoogleOAuth} disabled={loading} variant="outline">
          Test Google OAuth
        </Button>
        
        <Button onClick={testGitHubOAuth} disabled={loading} variant="outline">
          Test GitHub OAuth
        </Button>
      </div>

      {result && (
        <Alert>
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </Alert>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>First, run the database schema creation script in Supabase</li>
          <li>Test Sign Up to create a new user</li>
          <li>Test Session Check to verify authentication</li>
          <li>Test Sign In with the created credentials</li>
          <li>Test OAuth providers (requires configuration in .env)</li>
          <li>Test Sign Out to clear the session</li>
        </ol>
      </div>
    </div>
  )
}