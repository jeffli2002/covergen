// 修复注册后"Email not confirmed"的问题

/**
 * 问题原因：
 * 1. Supabase默认要求邮箱验证才能登录
 * 2. 用户注册后，session为null（因为邮箱未验证）
 * 3. 用户尝试登录时收到"Email not confirmed"错误
 */

// 解决方案1：修改Supabase设置（推荐用于开发/测试）
export const SUPABASE_AUTH_SETTINGS = `
在Supabase Dashboard中：
1. 进入 Authentication > Providers > Email
2. 找到 "Confirm email" 设置
3. 关闭 "Confirm email" (开发环境)
4. 或者保持开启但改善用户体验（生产环境）
`

// 解决方案2：改进注册流程的用户体验
export const IMPROVED_SIGNUP_FLOW = `
// authService.ts - 改进signUp方法
async signUp(email: string, password: string, metadata: any = {}) {
  const maxRetries = 3
  let lastError: any = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const supabaseClient = this.getSupabase()
      if (!supabaseClient) {
        throw new Error('Supabase not initialized')
      }
      
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata.fullName || '',
            role: metadata.role || 'user',
            avatar_url: metadata.avatarUrl || ''
          },
          // 添加邮件重定向URL
          emailRedirectTo: \`\${window.location.origin}/auth/confirm\`
        }
      })

      if (error) {
        if (error.message?.includes('already registered')) {
          throw new Error('This email is already registered. Please sign in instead.')
        }
        if (error.message?.includes('invalid')) {
          throw error
        }
        if (error.message?.includes('weak password')) {
          throw new Error('Password is too weak. Please use at least 6 characters.')
        }
        lastError = error
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          continue
        }
        throw error
      }

      // 检查是否需要邮箱确认
      if (data.user && !data.session) {
        return {
          success: true,
          user: data.user,
          session: null,
          needsEmailConfirmation: true,
          message: 'Account created! Please check your email to verify your account before signing in.'
        }
      }

      // 如果有session，说明不需要邮箱确认
      if (data.session) {
        this.storeSession(data.session)
        this.startSessionRefreshTimer()
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
        needsEmailConfirmation: false,
        message: 'Account created successfully!'
      }
    } catch (error: any) {
      if (attempt === maxRetries) {
        return {
          success: false,
          error: error.message || lastError?.message || 'Failed to create account'
        }
      }
    }
  }

  return { success: false, error: 'Failed to create account' }
}

// 添加重新发送确认邮件的方法
async resendConfirmationEmail(email: string) {
  try {
    const supabaseClient = this.getSupabase()
    if (!supabaseClient) {
      throw new Error('Supabase not initialized')
    }

    const { error } = await supabaseClient.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: \`\${window.location.origin}/auth/confirm\`
      }
    })

    if (error) throw error

    return {
      success: true,
      message: 'Confirmation email sent! Please check your inbox.'
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send confirmation email'
    }
  }
}
`

// 解决方案3：改进AuthForm组件的UI反馈
export const IMPROVED_AUTH_FORM = `
// AuthForm.tsx - 改进注册成功后的处理
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!validateForm()) return

  setIsLoading(true)
  setMessage({ type: '', text: '' })

  try {
    let result

    if (isLogin) {
      result = await signIn(formData.email, formData.password)
      
      // 特殊处理邮箱未确认的错误
      if (!result.success && result.error?.includes('Email not confirmed')) {
        setMessage({ 
          type: 'warning', 
          text: 'Please confirm your email before signing in. Check your inbox for the verification link.' 
        })
        setShowResendButton(true)
        setIsLoading(false)
        return
      }
    } else {
      result = await signUp(formData.email, formData.password, {
        fullName: formData.name
      })
      
      // 处理需要邮箱确认的情况
      if (result.success && result.needsEmailConfirmation) {
        setMessage({ 
          type: 'info', 
          text: result.message 
        })
        setShowEmailConfirmationMessage(true)
        setIsLoading(false)
        return
      }
    }

    if (result.success) {
      setMessage({ 
        type: 'success', 
        text: result.message || (isLogin ? 'Login successful!' : 'Account created!') 
      })
      
      // 只有在有session的情况下才关闭表单
      if (result.session) {
        setTimeout(() => {
          onAuthSuccess?.(result.user)
        }, 1000)
      }
    } else {
      setMessage({ type: 'error', text: result.error })
    }
  } catch (error) {
    setMessage({ type: 'error', text: 'Operation failed, please try again' })
  } finally {
    setIsLoading(false)
  }
}

// 添加重新发送确认邮件的UI
{showResendButton && (
  <Button
    variant="link"
    onClick={async () => {
      const result = await resendConfirmationEmail(formData.email)
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message || result.error
      })
    }}
  >
    Resend confirmation email
  </Button>
)}

// 添加邮箱确认提示
{showEmailConfirmationMessage && (
  <Alert className="mt-4">
    <Mail className="h-4 w-4" />
    <AlertTitle>Check your email</AlertTitle>
    <AlertDescription>
      We've sent a confirmation link to {formData.email}. 
      Please click the link to verify your account before signing in.
    </AlertDescription>
  </Alert>
)}
`

// 解决方案4：创建邮箱确认页面
export const EMAIL_CONFIRMATION_PAGE = `
// /src/app/auth/confirm/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function EmailConfirmPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Supabase会在URL中包含确认令牌
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    
    if (error) {
      setStatus('error')
      setMessage(errorDescription || 'Email confirmation failed')
    } else {
      setStatus('success')
      setMessage('Email confirmed successfully! You can now sign in.')
    }
  }, [searchParams])

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Email Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-500" />
              <p className="mt-4">Confirming your email...</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
              <p className="mt-4 text-green-600">{message}</p>
              <Link 
                href="/en" 
                className="mt-6 inline-block px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Go to Sign In
              </Link>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 mx-auto text-red-500" />
              <p className="mt-4 text-red-600">{message}</p>
              <Link 
                href="/en" 
                className="mt-6 inline-block px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Back to Home
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
`