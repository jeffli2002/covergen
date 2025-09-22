// BestAuth Sign In Form Component
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/BestAuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Icons } from '@/components/icons'

export function SignInForm() {
  const router = useRouter()
  const { signIn, signInWithOAuth, sendMagicLink } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMagicLink, setShowMagicLink] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await signIn(email, password)
      if (result.success) {
        router.push('/dashboard')
      } else {
        setError(result.error || 'Sign in failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await sendMagicLink(email)
      if (result.success) {
        setMagicLinkSent(true)
      } else {
        setError(result.error || 'Failed to send magic link')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (magicLinkSent) {
    return (
      <div className="space-y-4">
        <Alert>
          <Icons.mail className="h-4 w-4" />
          <div className="ml-2">
            <h3 className="font-semibold">Check your email</h3>
            <p className="text-sm text-muted-foreground">
              We sent a magic link to {email}. Click the link to sign in.
            </p>
          </div>
        </Alert>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setMagicLinkSent(false)
            setShowMagicLink(false)
          }}
        >
          Back to sign in
        </Button>
      </div>
    )
  }

  if (showMagicLink) {
    return (
      <form onSubmit={handleMagicLink} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <Icons.alertCircle className="h-4 w-4" />
            <span className="ml-2">{error}</span>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Sending magic link...
            </>
          ) : (
            'Send magic link'
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setShowMagicLink(false)}
          disabled={loading}
        >
          Back to password sign in
        </Button>
      </form>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <Icons.alertCircle className="h-4 w-4" />
            <span className="ml-2">{error}</span>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a
              href="/auth/reset-password"
              className="text-sm text-muted-foreground hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid gap-2">
        <Button
          variant="outline"
          onClick={() => signInWithOAuth('google')}
          disabled={loading}
        >
          <Icons.google className="mr-2 h-4 w-4" />
          Google
        </Button>
        
        <Button
          variant="outline"
          onClick={() => signInWithOAuth('github')}
          disabled={loading}
        >
          <Icons.gitHub className="mr-2 h-4 w-4" />
          GitHub
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowMagicLink(true)}
          disabled={loading}
        >
          <Icons.mail className="mr-2 h-4 w-4" />
          Sign in with magic link
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <a
          href="/auth/signup"
          className="underline underline-offset-4 hover:text-primary"
        >
          Sign up
        </a>
      </p>
    </div>
  )
}