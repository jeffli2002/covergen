'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthDebug() {
  const [output, setOutput] = useState<string[]>([])
  
  const log = (msg: string) => {
    console.log(msg)
    setOutput(prev => [...prev, msg])
  }

  useEffect(() => {
    log('=== AUTH DEBUG PAGE LOADED ===')
    log(`Time: ${new Date().toISOString()}`)
    log(`URL: ${window.location.href}`)
  }, [])

  const runDiagnostics = () => {
    setOutput([]) // Clear previous output
    
    log('=== DIAGNOSTICS STARTED ===')
    log(`Time: ${new Date().toISOString()}`)
    
    // 1. Check Supabase client
    log('\n1. SUPABASE CLIENT:')
    log(`- Client exists: ${!!supabase}`)
    log(`- URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
    
    // 2. Check cookies
    log('\n2. COOKIES:')
    const cookies = document.cookie
    if (cookies) {
      log(`- Raw: ${cookies.substring(0, 200)}...`)
      const cookieArray = cookies.split('; ')
      log(`- Count: ${cookieArray.length}`)
      cookieArray.forEach(c => {
        if (c.includes('sb-') || c.includes('supabase')) {
          log(`  - ${c.substring(0, 100)}...`)
        }
      })
    } else {
      log('- No cookies found')
    }
    
    // 3. Check localStorage
    log('\n3. LOCALSTORAGE:')
    try {
      const keys = Object.keys(localStorage)
      log(`- Total keys: ${keys.length}`)
      
      const authKeys = keys.filter(k => 
        k.includes('auth') || 
        k.includes('sb-') || 
        k.includes('supabase')
      )
      
      log(`- Auth-related keys: ${authKeys.length}`)
      authKeys.forEach(k => {
        const val = localStorage.getItem(k)
        log(`  - ${k}:`)
        log(`    ${val?.substring(0, 100)}...`)
      })
    } catch (e: any) {
      log(`- Error accessing localStorage: ${e.message}`)
    }
    
    // 4. Check session (async)
    log('\n4. CHECKING SESSION...')
    supabase.auth.getSession()
      .then(({ data, error }: { data: any; error: any }) => {
        if (error) {
          log(`- Error: ${error.message}`)
        } else {
          log(`- Session exists: ${!!data.session}`)
          if (data.session) {
            log(`- User: ${data.session.user.email}`)
            log(`- Provider: ${data.session.user.app_metadata?.provider}`)
            log(`- Expires: ${new Date(data.session.expires_at! * 1000).toLocaleString()}`)
          }
        }
      })
      .catch(e => {
        log(`- Exception: ${e.message}`)
      })
      
    // 5. Check user (async)
    supabase.auth.getUser()
      .then(({ data, error }) => {
        log('\n5. USER CHECK:')
        if (error) {
          log(`- Error: ${error.message}`)
        } else {
          log(`- User exists: ${!!data.user}`)
          if (data.user) {
            log(`- Email: ${data.user.email}`)
          }
        }
      })
  }

  const trySignIn = async () => {
    log('\n=== ATTEMPTING SIGN IN ===')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/en/auth-debug`
      }
    })
    
    if (error) {
      log(`Error: ${error.message}`)
    } else {
      log('OAuth initiated')
      log(`URL: ${data?.url}`)
    }
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>
      
      <div className="flex gap-2 mb-4">
        <button 
          onClick={runDiagnostics}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Run Diagnostics
        </button>
        
        <button 
          onClick={trySignIn}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Try Sign In
        </button>
        
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Reload
        </button>
      </div>
      
      <div className="bg-black text-green-400 p-4 rounded font-mono text-sm whitespace-pre-wrap">
        {output.join('\n')}
      </div>
    </div>
  )
}