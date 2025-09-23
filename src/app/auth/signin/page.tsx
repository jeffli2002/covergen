// BestAuth Sign In Page
import { Metadata } from 'next'
import { SignInForm } from '@/components/auth/SignInForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sign In | CoverImage',
  description: 'Sign in to your CoverImage account',
}

export default function SignInPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  )
}