import { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'CoverGen',
  description: 'AI Cover Generator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}