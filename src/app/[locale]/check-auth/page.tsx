'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import authService from '@/services/authService'

export default function CheckAuth() {
  const [output, setOutput] = useState<string[]>([])
  
  const log = (msg: string) => {
    console.log(msg)
    setOutput(prev => [...prev, msg])
  }

  const checkAuth = async () => {
    setOutput([])
    log('=== AUTH CHECK ===')
    log(`Time: ${new Date().toISOString()}`)
    
    // 1. Check Supabase session directly
    log('\n1. Supabase Direct Check:')
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        log(`Error: ${error.message}`)
      } else {
        log(`Session exists: ${!!session}`)
        if (session) {
          log(`User: ${session.user.email}`)
          log(`Expires at: ${session.expires_at}`)
          log(`Expires at (date): ${new Date(session.expires_at! * 1000).toISOString()}`)
          log(`Token preview: ${session.access_token.substring(0, 50)}...`)
        }
      }
    } catch (e: any) {
      log(`Exception: ${e.message}`)
    }
    
    // 2. Check Auth Service
    log('\n2. Auth Service Check:')
    try {
      await authService.initialize()
      const user = authService.getCurrentUser()
      const session = authService.getCurrentSession()
      log(`User: ${user ? user.email : 'null'}`)
      log(`Session: ${session ? 'exists' : 'null'}`)
      log(`Is authenticated: ${authService.isAuthenticated()}`)
    } catch (e: any) {
      log(`Exception: ${e.message}`)
    }
    
    // 3. Check localStorage
    log('\n3. localStorage Check:')
    const keys = Object.keys(localStorage).filter(k => 
      k.includes('auth') || k.includes('sb-') || k.includes('supabase')
    )
    log(`Auth keys found: ${keys.length}`)
    keys.forEach(k => {
      const val = localStorage.getItem(k)
      log(`${k}: ${val?.substring(0, 100)}...`)
    })
  }
  
  const refreshSession = async () => {
    log('\n=== REFRESHING SESSION ===')
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      if (error) {
        log(`Refresh error: ${error.message}`)
      } else {
        log(`Refresh successful!`)
        if (session) {
          log(`New expires at: ${new Date(session.expires_at! * 1000).toISOString()}`)
        }
      }
    } catch (e: any) {
      log(`Exception: ${e.message}`)
    }
  }
  
  const manualRefreshAuth = async () => {
    log('\n=== MANUAL AUTH SERVICE REFRESH ===')
    try {
      const result = await authService.initialize()
      log(`Refresh result: ${result}`)
      const user = authService.getCurrentUser()
      log(`User after refresh: ${user ? user.email : 'null'}`)
    } catch (e: any) {
      log(`Exception: ${e.message}`)
    }
  }
  
  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Check</h1>
      
      <div className="flex gap-2 mb-4">
        <button 
          onClick={checkAuth}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Check Auth
        </button>
        
        <button 
          onClick={refreshSession}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Refresh Session
        </button>
        
        <button 
          onClick={manualRefreshAuth}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Manual Auth Refresh
        </button>
      </div>
      
      <div className="bg-black text-green-400 p-4 rounded font-mono text-sm whitespace-pre-wrap">
        {output.join('\n') || 'Loading...'}
      </div>
    </div>
  )
}