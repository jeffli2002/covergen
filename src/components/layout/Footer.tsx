'use client'

import Link from 'next/link'
import { Twitter, Mail, Linkedin, Github } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'

interface FooterProps {
  locale: Locale
  translations: any
}

export default function Footer({ locale, translations: t }: FooterProps) {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <img src="/blueLogoTransparent.png" alt="CoverGen Pro" className="h-8 w-auto" />
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
              Professional AI-powered design tool for creating stunning thumbnails and covers for all major platforms.
            </p>
            <div className="flex gap-4 mt-4">
              <a
                href="https://twitter.com/covergen"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/company/covergen"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:support@covergen.pro"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Products</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={`/${locale}/tools/youtube-thumbnail-ideas`} className="text-gray-600 hover:text-gray-900 transition-colors">
                  Thumbnail Ideas
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/tools/thumbnail-tester`} className="text-gray-600 hover:text-gray-900 transition-colors">
                  A/B Testing
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/tools/thumbnail-maker-hub`} className="text-gray-600 hover:text-gray-900 transition-colors">
                  Template Hub
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#pricing`} className="text-gray-600 hover:text-gray-900 transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Templates */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Templates</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={`/${locale}/platforms/youtube`} className="text-gray-600 hover:text-gray-900 transition-colors">
                  YouTube
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/tools/instagram-thumbnail-maker`} className="text-gray-600 hover:text-gray-900 transition-colors">
                  Instagram
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/tools/linkedin-banner-maker`} className="text-gray-600 hover:text-gray-900 transition-colors">
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/tools/podcast-cover-maker`} className="text-gray-600 hover:text-gray-900 transition-colors">
                  Podcast
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/tools/kindle-cover-creator`} className="text-gray-600 hover:text-gray-900 transition-colors">
                  Book Cover
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/tools/discord-banner-maker`} className="text-gray-600 hover:text-gray-900 transition-colors">
                  Discord
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/tools/wattpad-cover-maker`} className="text-gray-600 hover:text-gray-900 transition-colors">
                  Wattpad
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={`/${locale}/tutorials`} className="text-gray-600 hover:text-gray-900 transition-colors">
                  Tutorials
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/blog`} className="text-gray-600 hover:text-gray-900 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#faq`} className="text-gray-600 hover:text-gray-900 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/support`} className="text-gray-600 hover:text-gray-900 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/feedback`} className="text-gray-600 hover:text-gray-900 transition-colors">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={`/${locale}/about`} className="text-gray-600 hover:text-gray-900 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="text-gray-600 hover:text-gray-900 transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="text-gray-600 hover:text-gray-900 transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/refund`} className="text-gray-600 hover:text-gray-900 transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="text-gray-600 hover:text-gray-900 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © 2025 CoverGen Pro. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link href={`/${locale}/cookies`} className="hover:text-gray-900 transition-colors">
                Cookie Settings
              </Link>
              <Link href={`/${locale}/accessibility`} className="hover:text-gray-900 transition-colors">
                Accessibility
              </Link>
              <span className="text-gray-400">•</span>
              <span>Made with ❤️ in California</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}