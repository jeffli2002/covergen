'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'

export default function DebugCookiesPage() {
  const [cookies, setCookies] = useState<string[]>([])
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [supabaseUrl, setSupabaseUrl] = useState<string>('')

  useEffect(() => {
    // Get all cookies
    const allCookies = document.cookie.split(';').map(c => c.trim())
    setCookies(allCookies)

    // Get Supabase URL info
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    setSupabaseUrl(url)

    // Check session
    checkSession()
  }, [])

  const checkSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    setSessionInfo({
      hasSession: !!session,
      user: session?.user?.email,
      error: error?.message
    })
  }

  const expectedCookieName = () => {
    if (!supabaseUrl) return 'N/A'
    try {
      const projectId = supabaseUrl.split('//')[1].split('.')[0]
      return `sb-${projectId}-auth-token`
    } catch {
      return 'Error calculating'
    }
  }

  const getCookieValue = (name: string) => {
    const cookie = cookies.find(c => c.startsWith(name + '='))
    if (!cookie) return null
    return cookie.split('=')[1]
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Cookie Debug Information</h1>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Supabase Configuration</h2>
            <div className="bg-gray-100 p-4 rounded font-mono text-sm">
              <p>URL: {supabaseUrl}</p>
              <p>Expected Cookie: {expectedCookieName()}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Session Status</h2>
            <div className="bg-gray-100 p-4 rounded">
              <p>Has Session: {sessionInfo?.hasSession ? 'Yes' : 'No'}</p>
              <p>User: {sessionInfo?.user || 'None'}</p>
              {sessionInfo?.error && <p className="text-red-600">Error: {sessionInfo.error}</p>}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">All Cookies</h2>
            <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs max-h-96 overflow-y-auto">
              {cookies.length === 0 ? (
                <p>No cookies found</p>
              ) : (
                cookies.map((cookie, i) => {
                  const [name, ...valueParts] = cookie.split('=')
                  const value = valueParts.join('=')
                  const isSupabaseCookie = name.startsWith('sb-')
                  
                  return (
                    <div key={i} className={`mb-2 ${isSupabaseCookie ? 'text-green-400' : ''}`}>
                      <div className="font-bold">{name}:</div>
                      <div className="ml-4 break-all">
                        {value ? (value.length > 100 ? value.substring(0, 100) + '...' : value) : '(empty)'}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Supabase Auth Cookies</h2>
            <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs">
              {cookies.filter(c => c.startsWith('sb-')).map((cookie, i) => (
                <div key={i} className="mb-2">
                  <div className="text-blue-400">{cookie.split('=')[0]}</div>
                  <div className="ml-4 text-gray-300">
                    {(() => {
                      try {
                        const value = cookie.split('=').slice(1).join('=')
                        const decoded = decodeURIComponent(value)
                        if (decoded.startsWith('{')) {
                          const parsed = JSON.parse(decoded)
                          return <pre>{JSON.stringify(parsed, null, 2)}</pre>
                        }
                        return decoded
                      } catch {
                        return '(unable to decode)'
                      }
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button 
            onClick={checkSession} 
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Refresh Session Check
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Reload Page
          </button>
        </div>
      </Card>
    </div>
  )
}