'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { User, Mail, Lock, Eye, EyeOff, Chrome, Wand2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface AuthFormProps {
  onAuthSuccess?: (user: any) => void
  onClose?: () => void
}

export default function AuthForm({ onAuthSuccess, onClose }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (message.text) {
      setMessage({ type: '', text: '' })
    }
  }

  const validateForm = () => {
    const { email, password, confirmPassword, name } = formData
    
    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please fill in email and password' })
      return false
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' })
      return false
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return false
    }

    if (!isLogin) {
      if (!name.trim()) {
        setMessage({ type: 'error', text: 'Please enter your name' })
        return false
      }

      if (password !== confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match' })
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setMessage({ type: '', text: '' })

    try {
      let result

      if (isLogin) {
        result = await signIn(formData.email, formData.password)
      } else {
        result = await signUp(formData.email, formData.password, {
          fullName: formData.name
        })
      }

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: result.message || (isLogin ? 'Login successful!' : 'Account created!') 
        })
        
        setTimeout(() => {
          onAuthSuccess?.(result.user)
        }, 1000)
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Operation failed, please try again' })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleForm = () => {
    setIsLogin(!isLogin)
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
    setMessage({ type: '', text: '' })
  }

  const handleGoogleSignIn = async () => {
    console.log('[AuthForm] Google sign in clicked at', new Date().toISOString())
    setIsLoading(true)
    setMessage({ type: '', text: '' })

    try {
      console.log('[AuthForm] Calling signInWithGoogle...')
      
      // Add a small delay to see if the loading state shows
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const result = await signInWithGoogle()
      
      console.log('[AuthForm] signInWithGoogle result:', result)
      
      if (result && result.success) {
        console.log('[AuthForm] OAuth successful, should redirect now')
        setMessage({ type: 'info', text: 'Redirecting to Google...' })
        // The page will redirect for OAuth flow
      } else {
        console.error('[AuthForm] OAuth failed:', result?.error || 'Unknown error')
        setMessage({ type: 'error', text: result?.error || 'Google login failed' })
      }
    } catch (error: any) {
      console.error('[AuthForm] OAuth exception:', error)
      console.error('[AuthForm] Error stack:', error.stack)
      setMessage({ type: 'error', text: `Google login failed: ${error.message}` })
    } finally {
      console.log('[AuthForm] OAuth process completed, setting loading to false')
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!formData.email) {
      setMessage({ type: 'error', text: 'Please enter your email address first' })
      return
    }

    setIsLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const result = await resetPassword(formData.email)
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message })
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Password reset failed' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Wand2 className="h-12 w-12 text-purple-600" />
            <span className="text-3xl font-bold text-white ml-2">CoverGen Pro</span>
          </div>
          <p className="text-gray-200">Create stunning covers with AI</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-center">
                {isLogin ? 'Sign In to CoverGen Pro' : 'Join CoverGen Pro'}
              </CardTitle>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              )}
            </div>
            <p className="text-center text-gray-600 text-sm">
              {isLogin 
                ? 'Sign in to continue creating' 
                : 'Create your account to start'
              }
            </p>
          </CardHeader>
          <CardContent>
            {message.text && (
              <Alert className={`mb-4 ${message.type === 'error' ? 'border-red-500' : message.type === 'info' ? 'border-blue-500' : 'border-green-500'}`}>
                <p className={message.type === 'error' ? 'text-red-600' : message.type === 'info' ? 'text-blue-600' : 'text-green-600'}>
                  {message.text}
                </p>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="Enter your full name"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="Enter your email"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="Confirm your password"
                      required={!isLogin}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (isLogin ? 'Signing In...' : 'Creating Account...') : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>

              {isLogin && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="text-sm text-purple-600 hover:underline"
                    disabled={isLoading}
                  >
                    Forgot your password?
                  </button>
                </div>
              )}
            </form>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full mt-4 flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-medium shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-base">{isLoading ? 'Redirecting...' : 'Continue with Google'}</span>
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={toggleForm}
                  className="ml-1 text-purple-600 hover:underline font-medium"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            {!isLogin && (
              <div className="mt-4 p-3 bg-purple-50 rounded-md">
                <p className="text-xs text-purple-800">
                  By creating an account, you agree to our Terms of Service and Privacy Policy. 
                  Free users can create up to 3 images per day.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold text-white mb-4">Why Choose CoverGen Pro?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="font-medium text-purple-300">AI-Powered</div>
              <div className="text-gray-200">Instant cover generation</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="font-medium text-green-300">Multi-Platform</div>
              <div className="text-gray-200">All social media sizes</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="font-medium text-blue-300">Free Tier</div>
              <div className="text-gray-200">3 images daily</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}