'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-simple'
import { createSimpleClient } from '@/lib/supabase/simple-client'
import { createClient } from '@/utils/supabase/client'

export default function TestOAuthFix() {
  const [instancesCreated, setInstancesCreated] = useState<string[]>([])
  
  useEffect(() => {
    // Test that all imports return the same instance
    const instances: string[] = []
    
    // Test 1: Direct import
    instances.push(`Direct import (supabase): ${supabase}`)
    
    // Test 2: createSimpleClient function
    const client1 = createSimpleClient()
    instances.push(`createSimpleClient(): ${client1}`)
    
    // Test 3: createClient from utils
    const client2 = createClient
    instances.push(`createClient: ${client2}`)
    
    // Test 4: Multiple calls to createSimpleClient
    const client3 = createSimpleClient()
    const client4 = createSimpleClient()
    instances.push(`Multiple createSimpleClient calls same instance: ${client3 === client4}`)
    
    // Test 5: All should be the same instance
    instances.push(`All same instance: ${supabase === client1 && client1 === client2 && client2 === client3}`)
    
    setInstancesCreated(instances)
    
    // Check console for "Multiple GoTrueClient instances" warning
    console.log('OAuth Fix Test - Check console for any warnings about multiple instances')
  }, [])
  
  const handleOAuthTest = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${window.location.pathname}`
        }
      })
      
      if (error) {
        console.error('OAuth error:', error)
      }
    } catch (err) {
      console.error('OAuth test error:', err)
    }
  }
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">OAuth Fix Test</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Instance Creation Test</h2>
        <div className="bg-gray-100 p-4 rounded">
          {instancesCreated.map((instance, i) => (
            <div key={i} className="mb-2 font-mono text-sm">{instance}</div>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-2">OAuth Flow Test</h2>
        <p className="mb-4">Open browser console and click the button below. There should be NO warnings about "Multiple GoTrueClient instances"</p>
        <button 
          onClick={handleOAuthTest}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Google OAuth
        </button>
      </div>
      
      <div className="mt-8 text-sm text-gray-600">
        <p>If the fix is working correctly:</p>
        <ul className="list-disc ml-5 mt-2">
          <li>All instances should be the same (true)</li>
          <li>No "Multiple GoTrueClient instances" warning in console</li>
          <li>OAuth flow should work without errors</li>
        </ul>
      </div>
    </div>
  )
}