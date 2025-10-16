'use client'

import { useState } from 'react'

export default function SubscriptionCheckPage() {
  const [email, setEmail] = useState('994235892@qq.com')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkSubscription = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/debug/check-subscription?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Subscription Database Check</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Check User Subscription</h2>
          
          <div className="flex gap-4 mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={checkSubscription}
              disabled={loading || !email}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Checking...' : 'Check Database'}
            </button>
          </div>
          
          <p className="text-sm text-gray-600">
            This checks the database directly to see if the webhook updated the subscription.
          </p>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              {result.found ? (
                <span className="text-green-600">✓ Subscription Found</span>
              ) : (
                <span className="text-red-600">✗ No Subscription</span>
              )}
            </h2>
            
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>

            {!result.found && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Webhook Not Received</h3>
                <p className="text-sm text-yellow-700">
                  The database shows no subscription update. This means the Creem webhook was not delivered.
                </p>
                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                  <li>Check Creem Dashboard → Developers → Webhooks for delivery status</li>
                  <li>Verify webhook URL points to: <code className="bg-yellow-100 px-1">{window.location.origin}/api/webhooks/creem</code></li>
                  <li>Check Vercel Function Logs for any webhook errors</li>
                </ul>
              </div>
            )}

            {result.found && result.subscription.tier === 'free' && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Still on Free Tier</h3>
                <p className="text-sm text-blue-700">
                  Subscription exists but hasn't been upgraded yet. Check:
                </p>
                <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
                  <li>Last updated: <strong>{result.subscription.updated_at}</strong></li>
                  <li>Webhook should have updated tier to 'pro' or 'pro_plus'</li>
                  <li>Check webhook logs in Vercel for processing errors</li>
                </ul>
              </div>
            )}

            {result.found && result.subscription.tier !== 'free' && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">✓ Webhook Successfully Processed</h3>
                <p className="text-sm text-green-700">
                  Subscription has been upgraded to <strong>{result.subscription.tier}</strong>
                </p>
                <ul className="mt-2 text-sm text-green-700 list-disc list-inside">
                  <li>Status: <strong>{result.subscription.status}</strong></li>
                  <li>Last updated: <strong>{result.subscription.updated_at}</strong></li>
                  <li>If account page doesn't reflect this, try refreshing or clearing cache</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
