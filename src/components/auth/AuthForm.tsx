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
    setIsLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // Use popup OAuth with safe implementation
      const result = await signInWithGoogle(true)
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Sign in successful!' })
        // Close the auth modal if sign in was successful
        if (onClose) {
          setTimeout(() => {
            onClose()
          }, 1000)
        }
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Google login failed' })
    } finally {
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
                {isLogin ? 'Welcome Back!' : 'Join CoverGen Pro'}
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
              <Alert className={`mb-4 ${message.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
                <p className={message.type === 'error' ? 'text-red-600' : 'text-green-600'}>
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

            <Button
              type="button"
              variant="outline"
              className="w-full mt-4"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Chrome className="h-4 w-4 mr-2" />
              Continue with Google
            </Button>

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