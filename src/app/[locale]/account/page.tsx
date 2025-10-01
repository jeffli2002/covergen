import { Metadata } from 'next'
import AccountPageClient from './page-client'
import ClientBoundary from '@/components/client-boundary'

export const metadata: Metadata = {
  title: 'My Account - CoverGen AI',
  description: 'Manage your account, subscription, and billing settings.',
  keywords: [
    'my account',
    'account settings',
    'subscription management',
    'billing',
    'profile settings',
    'user dashboard',
    'account dashboard',
    'manage subscription',
    'sora 2 account',
    'sora 2 settings',
    'sora 2 dashboard'
  ],
  openGraph: {
    title: 'My Account - CoverGen AI',
    description: 'Manage your CoverGen AI account and subscription.',
    images: ['/account-og.jpg'],
  },
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