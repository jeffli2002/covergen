'use client'

import { Cookie, Shield, Settings, BarChart3, Globe, Clock, Mail, MapPin, ExternalLink } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'

interface CookiesPageClientProps {
  locale: Locale
  translations: any
}

export default function CookiesPageClient({ locale, translations: t }: CookiesPageClientProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Cookie className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Clock className="w-5 h-5 text-amber-500" />
            <p className="text-lg">Last Updated: August 31, 2025</p>
          </div>
        </div>

        {/* Cookie Notice */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 mb-12 border border-amber-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Cookie Policy</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            This Cookie Policy explains what cookies are, how we use them, and your choices regarding cookies on CoverGen Pro. We believe in transparency about our data practices and your privacy rights.
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="bg-blue-50 rounded-2xl p-6 mb-12 border border-blue-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Quick Navigation
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a href="#what-are-cookies" className="text-blue-600 hover:text-blue-700 hover:underline text-sm">What Are Cookies</a>
            <a href="#how-we-use" className="text-blue-600 hover:text-blue-700 hover:underline text-sm">How We Use Cookies</a>
            <a href="#types-of-cookies" className="text-blue-600 hover:text-blue-700 hover:underline text-sm">Types of Cookies</a>
            <a href="#third-party" className="text-blue-600 hover:text-blue-700 hover:underline text-sm">Third-Party Cookies</a>
            <a href="#manage-cookies" className="text-blue-600 hover:text-blue-700 hover:underline text-sm">Manage Cookies</a>
            <a href="#browser-settings" className="text-blue-600 hover:text-blue-700 hover:underline text-sm">Browser Settings</a>
            <a href="#updates" className="text-blue-600 hover:text-blue-700 hover:underline text-sm">Policy Updates</a>
            <a href="#contact" className="text-blue-600 hover:text-blue-700 hover:underline text-sm">Contact Us</a>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* What Are Cookies */}
          <section id="what-are-cookies" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Cookie className="w-6 h-6 text-amber-600" />
              What Are Cookies?
            </h2>
            
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide a better user experience.
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Key Facts About Cookies:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>They help websites remember your preferences and settings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>They cannot harm your device or access your personal files</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>You can control and delete cookies through your browser settings</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Cookies */}
          <section id="how-we-use" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Why We Use Cookies</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Essential Functions
                </h3>
                <p className="text-gray-700 text-sm">
                  Enable core features like user authentication, security, and maintaining your session
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Analytics & Performance
                </h3>
                <p className="text-gray-700 text-sm">
                  Help us understand how visitors use our site so we can improve the user experience
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Personalization
                </h3>
                <p className="text-gray-700 text-sm">
                  Remember your preferences, language settings, and recently used features
                </p>
              </div>

              <div className="border-l-4 border-amber-500 pl-6">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-600" />
                  Functionality
                </h3>
                <p className="text-gray-700 text-sm">
                  Enable enhanced features and functionality across our platform
                </p>
              </div>
            </div>
          </section>

          {/* Types of Cookies */}
          <section id="types-of-cookies" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Types of Cookies We Use</h2>
            
            <div className="space-y-6">
              {/* First-Party Cookies Table */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">First-Party Cookies</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cookie Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Purpose</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="bg-white">
                        <td className="px-6 py-4 text-sm text-gray-700">auth_token</td>
                        <td className="px-6 py-4 text-sm text-gray-700">User authentication and session management</td>
                        <td className="px-6 py-4 text-sm text-gray-700">Session</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-700">user_preferences</td>
                        <td className="px-6 py-4 text-sm text-gray-700">Stores UI preferences and settings</td>
                        <td className="px-6 py-4 text-sm text-gray-700">1 year</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="px-6 py-4 text-sm text-gray-700">locale</td>
                        <td className="px-6 py-4 text-sm text-gray-700">Language preference</td>
                        <td className="px-6 py-4 text-sm text-gray-700">1 year</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-700">cookie_consent</td>
                        <td className="px-6 py-4 text-sm text-gray-700">Tracks cookie consent status</td>
                        <td className="px-6 py-4 text-sm text-gray-700">1 year</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="px-6 py-4 text-sm text-gray-700">recent_projects</td>
                        <td className="px-6 py-4 text-sm text-gray-700">Quick access to recent work</td>
                        <td className="px-6 py-4 text-sm text-gray-700">30 days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Session vs Persistent */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Session Cookies</h4>
                  <p className="text-sm text-gray-700">
                    Temporary cookies that are deleted when you close your browser. Used for maintaining your session.
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Persistent Cookies</h4>
                  <p className="text-sm text-gray-700">
                    Remain on your device for a set period. Used to remember your preferences across visits.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section id="third-party" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Third-Party Services</h2>
            
            <p className="text-gray-700 mb-6">
              We use trusted third-party services that may set their own cookies. These help us analyze usage and provide essential features:
            </p>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">Google Analytics</h4>
                    <p className="text-sm text-gray-600 mt-1">Website analytics and performance monitoring</p>
                  </div>
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">Stripe</h4>
                    <p className="text-sm text-gray-600 mt-1">Secure payment processing (only on payment pages)</p>
                  </div>
                  <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">Cloudflare</h4>
                    <p className="text-sm text-gray-600 mt-1">Security and performance optimization</p>
                  </div>
                  <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> We carefully select our partners and ensure they comply with privacy regulations. Click the links to view their privacy policies.
              </p>
            </div>
          </section>

          {/* Managing Cookies */}
          <section id="manage-cookies" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Settings className="w-6 h-6 text-blue-600" />
              Managing Your Cookie Preferences
            </h2>
            
            <div className="space-y-6">
              <p className="text-gray-700">
                You have full control over cookies. Here are your options:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Cookie Settings</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Use our Cookie Consent Manager to control which cookies you accept
                  </p>
                  <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                    Open Cookie Settings →
                  </button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Browser Controls</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Configure your browser to block or delete cookies
                  </p>
                  <a href="#browser-settings" className="text-amber-600 hover:text-amber-700 font-medium text-sm">
                    View Instructions →
                  </a>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Impact of Disabling Cookies</h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Some features may not function properly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>You may need to log in more frequently</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Your preferences may not be saved between visits</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Browser Settings */}
          <section id="browser-settings" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Browser Cookie Settings</h2>
            
            <p className="text-gray-700 mb-6">
              Most web browsers allow you to control cookies through their settings. Here's how to manage cookies in popular browsers:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" 
                 className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                <span className="font-medium text-gray-900 group-hover:text-blue-600">Chrome</span>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
              </a>

              <a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener noreferrer" 
                 className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                <span className="font-medium text-gray-900 group-hover:text-blue-600">Firefox</span>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
              </a>

              <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" 
                 className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                <span className="font-medium text-gray-900 group-hover:text-blue-600">Safari</span>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
              </a>

              <a href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" 
                 className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                <span className="font-medium text-gray-900 group-hover:text-blue-600">Edge</span>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
              </a>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Learn More About Cookies</h4>
              <div className="space-y-2">
                <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" 
                   className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-2">
                  www.aboutcookies.org
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" 
                   className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-2">
                  www.allaboutcookies.org
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </section>

          {/* Updates */}
          <section id="updates" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for operational, legal, or regulatory reasons. We will post any changes on this page with an updated revision date.
            </p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Check this page periodically to stay informed about our use of cookies.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section id="contact" className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-sm border border-amber-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions About Cookies?</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-600" />
                  English
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <a href="mailto:contact@covergen.pro" className="text-amber-600 hover:text-amber-700 font-medium">
                        contact@covergen.pro
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="text-gray-900">
                        CoverGen Pro, Privacy Department<br />
                        Beijing, China
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-600" />
                  中文
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">邮箱</p>
                      <a href="mailto:contact@covergen.pro" className="text-amber-600 hover:text-amber-700 font-medium">
                        contact@covergen.pro
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">地址</p>
                      <p className="text-gray-900">
                        CoverGen Pro 隐私部门<br />
                        中国 北京
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            © 2025 CoverGen Pro. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}