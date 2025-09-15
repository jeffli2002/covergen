import { Providers } from '@/components/providers'

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  return (
    <Providers>
      {children}
    </Providers>
  )
}