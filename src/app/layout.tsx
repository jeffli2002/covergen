import { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}