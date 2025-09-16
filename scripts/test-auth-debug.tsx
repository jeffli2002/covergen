'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestAuthDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  
  useEffect(() => {
    const debugAuth = async () => {
      const info: any = {}
      
      // 1. 检查所有cookies
      info.allCookies = document.cookie
      info.supabaseCookies = document.cookie
        .split(';')
        .filter(c => c.trim().startsWith('sb-'))
        .map(c => c.trim().split('=')[0])
      
      // 2. 检查Supabase客户端
      info.hasSupabaseClient = !!supabase
      
      if (supabase) {
        // 3. 尝试获取session
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          info.sessionCheck = {
            hasSession: !!session,
            error: sessionError?.message,
            accessToken: session?.access_token ? 'present' : 'missing',
            refreshToken: session?.refresh_token ? 'present' : 'missing',
            userId: session?.user?.id,
            userEmail: session?.user?.email,
            expiresAt: session?.expires_at
          }
        } catch (e: any) {
          info.sessionError = e.message
        }
        
        // 4. 尝试获取用户
        try {
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          info.userCheck = {
            hasUser: !!user,
            error: userError?.message,
            userId: user?.id,
            email: user?.email,
            createdAt: user?.created_at,
            lastSignInAt: user?.last_sign_in_at
          }
        } catch (e: any) {
          info.userError = e.message
        }
        
        // 5. 检查auth状态订阅
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('[Auth State Change]', event, session?.user?.email)
        })
        
        info.authSubscription = !!subscription
        
        // 清理订阅
        setTimeout(() => subscription?.unsubscribe(), 100)
      }
      
      // 6. 检查localStorage
      const authKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('sb-') || key.includes('supabase')
      )
      info.localStorageKeys = authKeys
      
      // 7. 检查URL参数
      const urlParams = new URLSearchParams(window.location.search)
      info.urlParams = Object.fromEntries(urlParams.entries())
      
      setDebugInfo(info)
    }
    
    debugAuth()
  }, [])
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Information</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      
      <div className="mt-4 space-y-2">
        <h2 className="text-xl font-semibold">Quick Analysis:</h2>
        {debugInfo.sessionCheck?.hasSession ? (
          <p className="text-green-600">✅ Session found: {debugInfo.sessionCheck.userEmail}</p>
        ) : (
          <p className="text-red-600">❌ No session found</p>
        )}
        
        {debugInfo.userCheck?.hasUser ? (
          <p className="text-green-600">✅ User found: {debugInfo.userCheck.email}</p>
        ) : (
          <p className="text-red-600">❌ No user found</p>
        )}
        
        {debugInfo.supabaseCookies?.length > 0 ? (
          <p className="text-green-600">✅ Supabase cookies found: {debugInfo.supabaseCookies.join(', ')}</p>
        ) : (
          <p className="text-red-600">❌ No Supabase cookies found</p>
        )}
      </div>
    </div>
  )
}