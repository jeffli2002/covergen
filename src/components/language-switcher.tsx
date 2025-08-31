'use client'

import { usePathname, useRouter } from 'next/navigation'
import { i18n, type Locale } from '@/lib/i18n/config'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

interface LanguageSwitcherProps {
  currentLocale: Locale
}

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLocaleChange = (newLocale: string) => {
    // Remove the current locale from the pathname
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')
    
    router.push(newPath)
  }

  const currentLocaleInfo = i18n.locales.find(l => l.code === currentLocale)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline-block">
            {currentLocaleInfo?.flag} {currentLocaleInfo?.name}
          </span>
          <span className="sm:hidden">{currentLocaleInfo?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {i18n.locales.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            onClick={() => handleLocaleChange(locale.code)}
            className={`cursor-pointer ${locale.code === currentLocale ? 'bg-accent' : ''}`}
          >
            <span className="mr-2">{locale.flag}</span>
            <span>{locale.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}