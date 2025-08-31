'use client'

import Link from 'next/link'
import { Sparkles, Heart, Twitter, Mail } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'

interface FooterProps {
  locale: Locale
  translations: any
}

export default function Footer({ locale, translations: t }: FooterProps) {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t.common.appName}
              </h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t.footer.madeWith} <Heart className="inline w-4 h-4 text-red-500 mx-1" /> {t.footer.by}
            </p>
            <div className="flex gap-4 mt-4">
              <a
                href="https://twitter.com/jeffli2002"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="mailto:jefflee2002@gmail.com"
                className="text-gray-600 hover:text-blue-600 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product/Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t.footer.product}</h3>
            <ul className="space-y-3 text-base text-gray-600">
              <li>
                <Link href={`/${locale}#features`} className="hover:text-blue-600 transition-colors">
                  {t.navigation.features}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#pricing`} className="hover:text-blue-600 transition-colors">
                  {t.navigation.pricing}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#platforms`} className="hover:text-blue-600 transition-colors">
                  Platforms
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t.footer.company}</h3>
            <ul className="space-y-3 text-base text-gray-600">
              <li>
                <Link href={`/${locale}/support`} className="hover:text-blue-600 transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/feedback`} className="hover:text-blue-600 transition-colors">
                  Feedback
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#faq`} className="hover:text-blue-600 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t.footer.legal}</h3>
            <ul className="space-y-3 text-base text-gray-600">
              <li>
                <Link href={`/${locale}/privacy`} className="hover:text-blue-600 transition-colors">
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="hover:text-blue-600 transition-colors">
                  {t.footer.terms}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/cookies`} className="hover:text-blue-600 transition-colors">
                  {t.footer.cookies}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-300">
          <p className="text-center text-sm text-gray-600">
            {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  )
}