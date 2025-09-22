// BestAuth Verification Page
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Icons } from '@/components/icons'

export default function VerifyBestAuthPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runVerification = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/bestauth-verify')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runVerification()
  }, [])

  const getStatusIcon = (status: string) => {
    if (status === 'success' || status === 'exists' || status === 'disabled' || status === 'true') {
      return '✅'
    } else if (status === 'enabled') {
      return '⚠️'
    } else {
      return '❌'
    }
  }

  const getStatusColor = (status: string) => {
    if (status === 'ready') return 'text-green-600'
    if (status === 'issues_found') return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">BestAuth Schema Verification</h1>

      <div className="mb-4">
        <Button onClick={runVerification} disabled={loading}>
          {loading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Running verification...
            </>
          ) : (
            'Run Verification Again'
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <Icons.alertCircle className="h-4 w-4" />
          <div className="ml-2">
            <h3 className="font-semibold">Error</h3>
            <p className="text-sm">{error}</p>
            <p className="text-sm mt-1">
              Make sure you have added SUPABASE_SERVICE_ROLE_KEY to your .env.local
            </p>
          </div>
        </Alert>
      )}

      {results && (
        <div className="space-y-6">
          {/* Overall Status */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Overall Status</h2>
            <div className={`text-2xl font-bold ${getStatusColor(results.results?.summary?.overall_status)}`}>
              {results.ready_for_use ? '✅ Ready for Use' : '❌ Setup Incomplete'}
            </div>
          </div>

          {/* Detailed Results */}
          {results.results && (
            <>
              {/* Schema Check */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Schema Status</h3>
                <p>
                  {getStatusIcon(results.results.schema_exists)} BestAuth schema: {results.results.schema_exists ? 'exists' : 'missing'}
                </p>
              </div>

              {/* Tables Check */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Tables Status</h3>
                <div className="space-y-1 text-sm">
                  {Object.entries(results.results.tables).map(([table, status]) => (
                    <div key={table}>
                      {getStatusIcon(String(status))} {table}: {String(status)}
                    </div>
                  ))}
                </div>
              </div>

              {/* RLS Status */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Row Level Security Status</h3>
                <p className="text-sm text-gray-600 mb-2">
                  RLS should be DISABLED for all BestAuth tables
                </p>
                <div className="space-y-1 text-sm">
                  {Object.entries(results.results.rls_status).map(([table, status]) => (
                    <div key={table}>
                      {getStatusIcon(String(status))} {table}: {String(status)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Operations */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Database Operations Test</h3>
                <div className="space-y-1 text-sm">
                  {Object.entries(results.results.test_operations).map(([operation, status]) => (
                    <div key={operation}>
                      {getStatusIcon(String(status))} {operation}: {String(status)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuration */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Configuration</h3>
                <p>
                  {getStatusIcon(results.results.jwt_secret_configured)} JWT Secret: {results.results.jwt_secret_configured ? 'configured' : 'missing'}
                </p>
              </div>

              {/* Recommendations */}
              {results.results.recommendations && results.results.recommendations.length > 0 && (
                <Alert>
                  <Icons.alertCircle className="h-4 w-4" />
                  <div className="ml-2">
                    <h3 className="font-semibold">Recommendations</h3>
                    <ul className="list-disc list-inside text-sm mt-2">
                      {results.results.recommendations.map((rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </Alert>
              )}
            </>
          )}

          {/* Next Steps */}
          {results.ready_for_use ? (
            <Alert className="bg-green-50 border-green-200">
              <div>
                <h3 className="font-semibold text-green-800">✅ BestAuth is Ready!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Your database is properly configured. You can now:
                </p>
                <ul className="list-disc list-inside text-sm mt-2 text-green-700">
                  <li>Test authentication at <a href="/test-bestauth" className="underline">/test-bestauth</a></li>
                  <li>Configure OAuth providers in your .env.local</li>
                  <li>Start using BestAuth in your application</li>
                </ul>
              </div>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <Icons.alertCircle className="h-4 w-4" />
              <div className="ml-2">
                <h3 className="font-semibold">Setup Incomplete</h3>
                <p className="text-sm mt-1">
                  Please complete the recommendations above before using BestAuth.
                </p>
              </div>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
}