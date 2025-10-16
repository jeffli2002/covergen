'use client'

import { useState } from 'react'
import { env } from '@/env'

export default function WebhookTestPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState('subscription.update')
  const [productId, setProductId] = useState('')
  const [userId, setUserId] = useState('994235892@qq.com')
  const [customerId, setCustomerId] = useState('cust_test_123')

  const productIds = {
    pro_monthly: env.NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY || 'NOT_SET',
    pro_yearly: env.NEXT_PUBLIC_PRICE_ID_PRO_YEARLY || 'NOT_SET',
    proplus_monthly: env.NEXT_PUBLIC_PRICE_ID_PROPLUS_MONTHLY || 'NOT_SET',
    proplus_yearly: env.NEXT_PUBLIC_PRICE_ID_PROPLUS_YEARLY || 'NOT_SET',
  }

  const eventTemplates = {
    'subscription.update': {
      eventType: 'subscription.update',
      id: 'evt_test_' + Date.now(),
      object: {
        id: 'sub_test_123',
        customer: customerId,
        status: 'active',
        product: {
          id: productId || productIds.pro_monthly
        },
        metadata: {
          internal_customer_id: userId,
          userId: userId,
          planId: 'pro'
        },
        current_period_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false
      }
    },
    'checkout.completed': {
      eventType: 'checkout.completed',
      id: 'evt_test_' + Date.now(),
      object: {
        id: 'checkout_test_123',
        customer: {
          id: customerId,
          email: userId,
          external_id: userId
        },
        subscription: {
          id: 'sub_test_456',
          product: {
            id: productId || productIds.pro_monthly
          }
        },
        order: {
          product: productId || productIds.pro_monthly,
          amount: 1490
        },
        metadata: {
          internal_customer_id: userId,
          userId: userId,
          planId: 'pro',
          billingCycle: 'monthly'
        },
        trial_period_days: 0
      }
    }
  }

  const simulateWebhook = async () => {
    setLoading(true)
    setTestResult(null)

    try {
      const template = eventTemplates[selectedEvent as keyof typeof eventTemplates]
      
      const response = await fetch('/api/debug/simulate-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: template,
          testMode: true
        })
      })

      const result = await response.json()
      setTestResult(result)
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const testPlanExtraction = async () => {
    setLoading(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/debug/simulate-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testPlanExtraction: true,
          productId: productId || productIds.pro_monthly
        })
      })

      const result = await response.json()
      setTestResult(result)
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Creem Webhook Testing</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Environment Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Product IDs</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pro Monthly:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded">{productIds.pro_monthly}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pro Yearly:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded">{productIds.pro_yearly}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pro+ Monthly:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded">{productIds.proplus_monthly}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pro+ Yearly:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded">{productIds.proplus_yearly}</code>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Test Mode</h3>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Creem Test Mode:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      {env.NEXT_PUBLIC_CREEM_TEST_MODE || 'false'}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Controls */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Event Type</label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="subscription.update">subscription.update</option>
                  <option value="checkout.completed">checkout.completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">User ID / Email</label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="994235892@qq.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Customer ID</label>
                <input
                  type="text"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="cust_test_123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Product ID (leave empty for default)
                </label>
                <input
                  type="text"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder={productIds.pro_monthly}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default: {productIds.pro_monthly}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={simulateWebhook}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Testing...' : 'Simulate Webhook'}
                </button>
                
                <button
                  onClick={testPlanExtraction}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  Test Plan Extraction
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        {testResult && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            
            <div className={`p-4 rounded ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-start gap-2 mb-4">
                <span className={`text-2xl ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {testResult.success ? '✓' : '✗'}
                </span>
                <div>
                  <h3 className="font-semibold">
                    {testResult.success ? 'Success' : 'Failed'}
                  </h3>
                  {testResult.error && (
                    <p className="text-red-600 text-sm mt-1">{testResult.error}</p>
                  )}
                </div>
              </div>

              {/* Detailed Results */}
              <div className="space-y-4">
                {testResult.extractedPlan && (
                  <div>
                    <h4 className="font-medium mb-2">Extracted Plan</h4>
                    <div className="bg-white p-3 rounded border">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Plan ID:</span>
                        <code className="font-mono">{testResult.extractedPlan}</code>
                      </div>
                    </div>
                  </div>
                )}

                {testResult.extractedValues && (
                  <div>
                    <h4 className="font-medium mb-2">Extracted Values</h4>
                    <div className="bg-white p-3 rounded border">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(testResult.extractedValues, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {testResult.logs && testResult.logs.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Logs</h4>
                    <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-auto max-h-96">
                      {testResult.logs.map((log: string, i: number) => (
                        <div key={i} className="mb-1">{log}</div>
                      ))}
                    </div>
                  </div>
                )}

                {testResult.webhookResult && (
                  <div>
                    <h4 className="font-medium mb-2">Webhook Result</h4>
                    <div className="bg-white p-3 rounded border">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(testResult.webhookResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {testResult.rawResponse && (
                  <div>
                    <h4 className="font-medium mb-2">Raw Response</h4>
                    <div className="bg-white p-3 rounded border">
                      <pre className="text-xs overflow-auto max-h-64">
                        {JSON.stringify(testResult.rawResponse, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3 text-blue-900">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Check that Product IDs are configured correctly in the environment</li>
            <li>Enter the test user email (e.g., 994235892@qq.com)</li>
            <li>Optionally specify a Product ID to test specific product matching</li>
            <li>Click "Simulate Webhook" to send a test webhook event</li>
            <li>Click "Test Plan Extraction" to test just the getPlanFromProduct function</li>
            <li>Check the results and logs to see if planId is extracted correctly</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
