'use client'

import { useEffect, useState } from 'react'
import { PaymentAuthWrapper } from '@/services/payment/auth-wrapper'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning'
  message?: string
}

export default function TestPaymentIntegrationPage() {
  const { user, loading: authLoading } = useAuth()
  const [tests, setTests] = useState<TestResult[]>([])
  const [running, setRunning] = useState(false)
  const [consoleWarnings, setConsoleWarnings] = useState<string[]>([])

  useEffect(() => {
    // Capture console warnings
    const originalWarn = console.warn
    const warnings: string[] = []
    
    console.warn = (...args) => {
      const message = args.join(' ')
      warnings.push(message)
      setConsoleWarnings(prev => [...prev, message])
      originalWarn(...args)
    }

    return () => {
      console.warn = originalWarn
    }
  }, [])

  const runTests = async () => {
    setRunning(true)
    setConsoleWarnings([])
    const results: TestResult[] = []

    // Test 1: Auth Context Retrieval
    results.push({ name: 'Auth Context Retrieval', status: 'running' })
    setTests([...results])
    
    try {
      const context = await PaymentAuthWrapper.getAuthContext()
      const lastTest = results[results.length - 1]
      if (context) {
        lastTest.status = 'passed'
        lastTest.message = `User: ${context.email}, Valid: ${context.isValid}`
      } else {
        lastTest.status = authLoading ? 'warning' : 'failed'
        lastTest.message = authLoading ? 'Auth still loading' : 'No auth context available'
      }
    } catch (error: any) {
      results[results.length - 1].status = 'failed'
      results[results.length - 1].message = error.message
    }
    setTests([...results])

    // Test 2: Session Validity Check
    results.push({ name: 'Session Validity for Payments', status: 'running' })
    setTests([...results])
    
    try {
      const isValid = PaymentAuthWrapper.isSessionValidForPayment()
      const minMinutes = PaymentAuthWrapper.getMinSessionValidityMinutes()
      results[results.length - 1].status = isValid ? 'passed' : 'warning'
      results[results.length - 1].message = isValid 
        ? `Valid (requires ${minMinutes}+ minutes)`
        : `Not valid for payments (needs ${minMinutes}+ minutes remaining)`
    } catch (error: any) {
      results[results.length - 1].status = 'failed'
      results[results.length - 1].message = error.message
    }
    setTests([...results])

    // Test 3: Auth Headers Generation
    results.push({ name: 'Payment Auth Headers', status: 'running' })
    setTests([...results])
    
    try {
      const headers = await PaymentAuthWrapper.getPaymentAuthHeaders()
      if (headers) {
        results[results.length - 1].status = 'passed'
        results[results.length - 1].message = `Headers: ${Object.keys(headers).join(', ')}`
      } else {
        results[results.length - 1].status = 'warning'
        results[results.length - 1].message = 'No headers (session might be invalid)'
      }
    } catch (error: any) {
      results[results.length - 1].status = 'failed'
      results[results.length - 1].message = error.message
    }
    setTests([...results])

    // Test 4: Multiple Client Warning Check
    results.push({ name: 'No Multiple Client Warnings', status: 'running' })
    setTests([...results])
    
    await new Promise(resolve => setTimeout(resolve, 100)) // Wait for any warnings
    
    const multipleClientWarnings = consoleWarnings.filter(w => 
      w.includes('Multiple GoTrueClient') || 
      w.includes('multiple instances')
    )
    
    results[results.length - 1].status = multipleClientWarnings.length === 0 ? 'passed' : 'failed'
    results[results.length - 1].message = multipleClientWarnings.length === 0 
      ? 'No warnings detected'
      : `Found ${multipleClientWarnings.length} warnings`
    setTests([...results])

    // Test 5: API Endpoint Test
    results.push({ name: 'API Endpoint Verification', status: 'running' })
    setTests([...results])
    
    try {
      const response = await fetch('/api/test/payment-auth')
      const data = await response.json()
      
      results[results.length - 1].status = data.allTestsPassed ? 'passed' : 'failed'
      results[results.length - 1].message = data.allTestsPassed 
        ? 'All API tests passed'
        : 'Some API tests failed'
    } catch (error: any) {
      results[results.length - 1].status = 'failed'
      results[results.length - 1].message = error.message
    }
    setTests([...results])

    setRunning(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'running':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-200" />
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Payment Integration Test Suite</CardTitle>
          <CardDescription>
            Verify payment auth wrapper doesn't interfere with OAuth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Auth Status */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Current Auth Status</h3>
              <div className="text-sm space-y-1">
                <p>User: {user?.email || 'Not signed in'}</p>
                <p>Auth Loading: {authLoading ? 'Yes' : 'No'}</p>
              </div>
            </div>

            {/* Test Controls */}
            <div className="flex gap-4">
              <Button 
                onClick={runTests} 
                disabled={running || authLoading}
              >
                {running ? 'Running Tests...' : 'Run Tests'}
              </Button>
              {!user && (
                <p className="text-sm text-muted-foreground self-center">
                  Some tests require authentication
                </p>
              )}
            </div>

            {/* Test Results */}
            {tests.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Test Results</h3>
                {tests.map((test, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 border rounded-lg"
                  >
                    {getStatusIcon(test.status)}
                    <div className="flex-1">
                      <p className="font-medium">{test.name}</p>
                      {test.message && (
                        <p className="text-sm text-muted-foreground">{test.message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Console Warnings */}
            {consoleWarnings.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-red-600">Console Warnings</h3>
                <div className="mt-2 p-3 bg-red-50 rounded-lg">
                  {consoleWarnings.map((warning, index) => (
                    <p key={index} className="text-sm text-red-800">{warning}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {tests.length > 0 && !running && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Summary</h3>
                <div className="text-sm space-y-1">
                  <p>Total Tests: {tests.length}</p>
                  <p className="text-green-600">
                    Passed: {tests.filter(t => t.status === 'passed').length}
                  </p>
                  <p className="text-red-600">
                    Failed: {tests.filter(t => t.status === 'failed').length}
                  </p>
                  <p className="text-yellow-600">
                    Warnings: {tests.filter(t => t.status === 'warning').length}
                  </p>
                </div>
                {tests.every(t => t.status === 'passed') && (
                  <p className="mt-2 font-semibold text-green-600">
                    ✅ All tests passed! Payment integration is properly isolated.
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}