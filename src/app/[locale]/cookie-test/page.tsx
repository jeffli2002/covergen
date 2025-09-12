'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CookieTestPage() {
  const [cookies, setCookies] = useState<any>({})
  const [testResults, setTestResults] = useState<any>({})

  const checkCookies = () => {
    const allCookies = document.cookie.split(';').map(c => c.trim())
    const cookieMap: any = {}
    
    allCookies.forEach(cookie => {
      const [name, ...valueParts] = cookie.split('=')
      if (name) {
        cookieMap[name] = valueParts.join('=')
      }
    })
    
    setCookies(cookieMap)
  }

  const setCookieWithDomain = () => {
    // Test setting a cookie with domain
    document.cookie = `test-domain-cookie=test-value; Domain=.covergen.pro; Path=/; SameSite=None; Secure`
    setTestResults(prev => ({ ...prev, domainCookieSet: true }))
    checkCookies()
  }

  const setCookieWithoutDomain = () => {
    // Test setting a cookie without domain
    document.cookie = `test-no-domain-cookie=test-value; Path=/; SameSite=None; Secure`
    setTestResults(prev => ({ ...prev, noDomainCookieSet: true }))
    checkCookies()
  }

  const testCallbackWithCookies = async () => {
    const response = await fetch('/api/test-oauth-flow?action=callback&code=TEST')
    const data = await response.json()
    setTestResults(prev => ({ ...prev, callbackTest: data }))
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Cookie Configuration Test</h1>

      {/* Current Environment */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Environment</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'SSR'}</p>
          <p><strong>Hostname:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'SSR'}</p>
          <p><strong>Protocol:</strong> {typeof window !== 'undefined' ? window.location.protocol : 'SSR'}</p>
        </div>
      </Card>

      {/* Cookie Tests */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Cookie Tests</h2>
        <div className="space-y-4">
          <Button onClick={checkCookies}>Check Current Cookies</Button>
          <Button onClick={setCookieWithDomain} variant="outline">Set Cookie with Domain=.covergen.pro</Button>
          <Button onClick={setCookieWithoutDomain} variant="outline">Set Cookie without Domain</Button>
          <Button onClick={testCallbackWithCookies} variant="outline">Test Callback Cookie Reading</Button>
        </div>
        
        {testResults.domainCookieSet && (
          <p className="text-green-600 mt-2">✓ Cookie with domain set</p>
        )}
        {testResults.noDomainCookieSet && (
          <p className="text-green-600 mt-2">✓ Cookie without domain set</p>
        )}
      </Card>

      {/* Current Cookies */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Current Cookies</h2>
        <div className="bg-gray-100 p-4 rounded">
          {Object.keys(cookies).length === 0 ? (
            <p className="text-gray-500">No cookies found. Click "Check Current Cookies" first.</p>
          ) : (
            <div className="space-y-2 text-sm font-mono">
              {Object.entries(cookies).map(([name, value]: [string, any]) => (
                <div key={name} className="border-b pb-2">
                  <p className="font-bold text-blue-600">{name}:</p>
                  <p className="text-gray-600 break-all">{value.substring(0, 100)}{value.length > 100 ? '...' : ''}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Callback Test Results */}
      {testResults.callbackTest && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Callback Test Results</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(testResults.callbackTest, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  )
}