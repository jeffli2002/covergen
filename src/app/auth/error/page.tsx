// BestAuth Error Page
import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Icons } from '@/components/icons'

export const metadata: Metadata = {
  title: 'Authentication Error | CoverImage',
  description: 'An error occurred during authentication',
}

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string; reason?: string; message?: string }
}) {
  const error = searchParams.error || searchParams.reason
  const customMessage = searchParams.message

  const errorMessages: Record<string, string> = {
    oauth_error: 'There was an error connecting to the OAuth provider',
    missing_params: 'Required authentication parameters are missing',
    invalid_state: 'The authentication request is invalid or expired',
    oauth_failed: 'OAuth authentication failed',
    callback_error: 'There was an error processing the authentication',
    missing_token: 'The verification link is invalid or missing',
    invalid_link: 'The verification link is invalid or has expired',
    verification_error: 'There was an error verifying your account',
    invalid_token: 'The reset token is invalid or has expired',
    provider: 'OAuth provider error occurred',
    exchange: 'Failed to complete the authentication process',
    no_code: 'No authorization code received from OAuth provider',
    default: 'An unexpected error occurred during authentication',
  }

  const errorMessage = error && errorMessages[error] 
    ? errorMessages[error] 
    : errorMessages.default

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Authentication Error
          </h1>
        </div>
        
        <Alert variant="destructive">
          <Icons.alertCircle className="h-4 w-4" />
          <div className="ml-2">
            <h3 className="font-semibold">Something went wrong</h3>
            <p className="text-sm">{errorMessage}</p>
            {customMessage && (
              <p className="text-sm mt-1 font-mono">{customMessage}</p>
            )}
          </div>
        </Alert>

        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link href="/auth/signin">
              Try signing in again
            </Link>
          </Button>
          
          <Button asChild variant="outline">
            <Link href="/">
              Go back home
            </Link>
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          If you continue to experience issues, please{' '}
          <a href="/contact" className="underline underline-offset-4">
            contact support
          </a>
        </p>
      </div>
    </div>
  )
}