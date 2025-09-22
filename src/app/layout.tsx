import { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import GoogleAnalyticsPageView from '@/components/GoogleAnalyticsPageView'
import { AuthProvider } from '@/components/providers/auth-provider'

export const metadata: Metadata = {
  title: 'CoverGen',
  description: 'AI Cover Generator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        {gaId && (
          <>
            <GoogleAnalytics measurementId={gaId} />
            <GoogleAnalyticsPageView />
          </>
        )}
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}