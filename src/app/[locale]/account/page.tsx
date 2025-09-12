import { Metadata } from 'next'
import AccountPageClient from './page-client'
import ClientBoundary from '@/components/client-boundary'

export const metadata: Metadata = {
  title: 'My Account - CoverGen AI',
  description: 'Manage your account, subscription, and billing settings.',
}

interface AccountPageProps {
  params: {
    locale: string
  }
}

export default function AccountPage({ params }: AccountPageProps) {
  return (
    <ClientBoundary>
      <AccountPageClient locale={params.locale} />
    </ClientBoundary>
  )
}