'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function TestEmailPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const sendTestEmail = async () => {
    if (!email) {
      setError('Please enter an email address')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/debug/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to send test email')
        setResult(data)
      }
    } catch (err) {
      setError('Network error: ' + (err instanceof Error ? err.message : 'Unknown'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Email Service Test</CardTitle>
          <CardDescription>
            Test the Zoho email configuration by sending a verification email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Button 
              onClick={sendTestEmail} 
              disabled={loading || !email}
            >
              {loading ? 'Sending...' : 'Send Test Email'}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-4">
              <Alert variant={result.success ? 'default' : 'destructive'}>
                <AlertDescription>
                  {result.success ? 'Email sent successfully!' : 'Failed to send email'}
                </AlertDescription>
              </Alert>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Details:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>This test will:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check all required environment variables</li>
              <li>Display the email configuration being used</li>
              <li>Send a test verification email</li>
              <li>Show any errors that occur</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}