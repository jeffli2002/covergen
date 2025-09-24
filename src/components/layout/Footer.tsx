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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-2">
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
            <p className="text-sm text-gray-600 leading-relaxed">
              AI-powered cover generator with nano banana technology for YouTube, TikTok, Spotify, and more platforms.
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

          {/* Platforms */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Platforms</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href={`/${locale}/platforms/youtube`} className="hover:text-blue-600 transition-colors">
                  YouTube
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/platforms/tiktok`} className="hover:text-blue-600 transition-colors">
                  TikTok
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/platforms/instagram`} className="hover:text-blue-600 transition-colors">
                  Instagram
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/platforms/spotify`} className="hover:text-blue-600 transition-colors">
                  Spotify
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/platforms/twitch`} className="hover:text-blue-600 transition-colors">
                  Twitch
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/platforms/linkedin`} className="hover:text-blue-600 transition-colors">
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/platforms/wechat`} className="hover:text-blue-600 transition-colors">
                  WeChat
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/platforms/rednote`} className="hover:text-blue-600 transition-colors">
                  Rednote
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/platforms/bilibili`} className="hover:text-blue-600 transition-colors">
                  Bilibili
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tools</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href={`/${locale}/tools/anime-poster-maker`} className="hover:text-blue-600 transition-colors">
                  Anime Poster
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/tools/spotify-playlist-cover`} className="hover:text-blue-600 transition-colors">
                  Playlist Cover
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/tools/facebook-event-cover`} className="hover:text-blue-600 transition-colors">
                  Event Cover
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/tools/social-media-poster`} className="hover:text-blue-600 transition-colors">
                  Social Poster
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/tools/book-cover-creator`} className="hover:text-blue-600 transition-colors">
                  Book Cover
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/tools/game-cover-art`} className="hover:text-blue-600 transition-colors">
                  Game Cover
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/tools/music-album-cover`} className="hover:text-blue-600 transition-colors">
                  Album Cover
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-600">
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
                <Link href={`/${locale}/tutorials`} className="hover:text-blue-600 transition-colors">
                  Tutorials
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/blog`} className="hover:text-blue-600 transition-colors">
                  Blog
                </Link>
              </li>
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
            <ul className="space-y-2 text-sm text-gray-600">
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
                <Link href={`/${locale}/refund`} className="hover:text-blue-600 transition-colors">
                  {t.footer.refund || 'Refund Policy'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/cookies`} className="hover:text-blue-600 transition-colors">
                  {t.footer.cookies}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/accessibility`} className="hover:text-blue-600 transition-colors">
                  Accessibility
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
          <p className="text-center text-xs text-gray-500 mt-2 italic">
            * This platform is an independent product and is not affiliated with, endorsed by, or sponsored by Google. 
            We provide access to the Gemini 2.5 Flash model through our custom interface.
          </p>
        </div>
      </div>
    </footer>
  )
}