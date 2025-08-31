'use client'

import { Shield, Lock, Eye, Database, Globe, UserCheck, Clock, Mail, MapPin } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'

interface PrivacyPageClientProps {
  locale: Locale
  translations: any
}

export default function PrivacyPageClient({ locale, translations: t }: PrivacyPageClientProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Lock className="w-5 h-5 text-green-500" />
            <p className="text-lg">Last Updated: August 31, 2025</p>
          </div>
        </div>

        {/* Privacy Commitment */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 mb-12 border border-green-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Privacy Commitment</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            At CoverGen Pro, we take your privacy seriously. This policy explains how we collect, use, protect, and share your information in compliance with global privacy regulations including GDPR, CCPA, and other applicable laws.
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="bg-blue-50 rounded-2xl p-6 mb-12 border border-blue-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            Quick Navigation
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a href="#data-collection" className="text-blue-600 hover:text-blue-700 hover:underline text-sm">Data Collection</a>
            <a href="#data-usage" className="text-blue-600 hover:text-blue-700 hover:underline text-sm">How We Use Data</a>
            <a href="#data-sharing" className="text-blue-600 hover:text-blue-700 hover:underline text-sm">Data Sharing</a>
            <a href="#data-security" className="text-blue-600 hover:text-blue-700 hover:underline text-sm">Security Measures</a>
            <a href="#your-rights" className="text-blue-600 hover:text-blue-700 hover:underline text-sm">Your Rights</a>
            <a href="#cookies" className="text-blue-600 hover:text-blue-700 hover:underline text-sm">Cookies</a>
            <a href="#retention" className="text-blue-600 hover:text-blue-700 hover:underline text-sm">Data Retention</a>
            <a href="#contact" className="text-blue-600 hover:text-blue-700 hover:underline text-sm">Contact Us</a>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Data Collection */}
          <section id="data-collection" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Database className="w-6 h-6 text-green-600" />
              Information We Collect
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Personal Information</h3>
                <p className="text-sm text-gray-600 mb-3">Information you provide directly:</p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Email address (for account creation)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Name (optional)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Payment information (processed securely via third-party providers)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Profile information (avatar, bio)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Usage Information</h3>
                <p className="text-sm text-gray-600 mb-3">Information collected automatically:</p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Generated images and metadata</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Platform preferences and settings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Device and browser information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>IP address and location data</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> We use privacy-preserving analytics that do not track individual users across websites.
              </p>
            </div>
          </section>

          {/* How We Use Your Data */}
          <section id="data-usage" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How We Use Your Information</h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="font-semibold text-gray-900 mb-2">Service Delivery</h3>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• Provide and maintain our AI generation services</li>
                  <li>• Process your image generation requests</li>
                  <li>• Manage your account and subscriptions</li>
                </ul>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="font-semibold text-gray-900 mb-2">Improvement & Personalization</h3>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• Improve our AI models and generation quality</li>
                  <li>• Personalize your experience based on preferences</li>
                  <li>• Develop new features and services</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="font-semibold text-gray-900 mb-2">Communication</h3>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• Send service-related notifications</li>
                  <li>• Respond to your inquiries and support requests</li>
                  <li>• Send marketing communications (with your consent)</li>
                </ul>
              </div>

              <div className="border-l-4 border-amber-500 pl-6">
                <h3 className="font-semibold text-gray-900 mb-2">Legal & Security</h3>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• Comply with legal obligations</li>
                  <li>• Protect against fraud and abuse</li>
                  <li>• Enforce our terms of service</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section id="data-sharing" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Information Sharing & Disclosure</h2>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <p className="text-gray-700 font-semibold mb-2">
                We DO NOT sell, trade, or rent your personal information to third parties.
              </p>
            </div>

            <p className="text-gray-700 mb-4">We may share your information only in these circumstances:</p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">With Your Consent</h4>
                  <p className="text-sm text-gray-600">When you explicitly agree to share information</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Service Providers</h4>
                  <p className="text-sm text-gray-600">Trusted partners who help operate our service (under strict confidentiality)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Legal Requirements</h4>
                  <p className="text-sm text-gray-600">When required by law or to protect rights and safety</p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section id="data-security" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Lock className="w-6 h-6 text-blue-600" />
              Data Security Measures
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Technical Safeguards</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>✓ 256-bit SSL encryption for all data transfers</li>
                  <li>✓ Encrypted storage for sensitive information</li>
                  <li>✓ Regular security audits and testing</li>
                  <li>✓ Secure cloud infrastructure with redundancy</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Operational Security</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>✓ Limited access on need-to-know basis</li>
                  <li>✓ Employee security training</li>
                  <li>✓ Incident response procedures</li>
                  <li>✓ Regular backups and disaster recovery</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                While we implement robust security measures, no system is 100% secure. We encourage users to use strong passwords and enable two-factor authentication.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section id="your-rights" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <UserCheck className="w-6 h-6 text-green-600" />
              Your Privacy Rights
            </h2>
            
            <p className="text-gray-700 mb-6">
              Depending on your location, you may have the following rights regarding your personal data:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Access & Portability</h4>
                <p className="text-sm text-gray-700">Request a copy of your personal data in a portable format</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Correction</h4>
                <p className="text-sm text-gray-700">Update or correct inaccurate information</p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Deletion</h4>
                <p className="text-sm text-gray-700">Request deletion of your account and associated data</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Opt-out</h4>
                <p className="text-sm text-gray-700">Unsubscribe from marketing communications</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>To exercise these rights:</strong> Contact us at <a href="mailto:contact@covergen.pro" className="text-blue-600 hover:underline">contact@covergen.pro</a> or use the options in your account settings.
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section id="cookies" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies & Tracking Technologies</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar technologies to enhance your experience. For detailed information about our cookie usage, please see our Cookie Policy.
            </p>
            <a href={`/${locale}/cookies`} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
              View Cookie Policy
              <span className="text-sm">→</span>
            </a>
          </section>

          {/* Data Retention */}
          <section id="retention" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-600" />
              Data Retention
            </h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="font-semibold text-gray-900 mb-2">Active Accounts</h3>
                <p className="text-gray-700 text-sm">
                  We retain your data as long as your account is active or as needed to provide services
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="font-semibold text-gray-900 mb-2">Generated Content</h3>
                <p className="text-gray-700 text-sm">
                  Images are retained according to your subscription plan (30-90 days for free users, unlimited for Pro+)
                </p>
              </div>

              <div className="border-l-4 border-amber-500 pl-6">
                <h3 className="font-semibold text-gray-900 mb-2">After Account Deletion</h3>
                <p className="text-gray-700 text-sm">
                  Personal data is deleted within 30 days, except where retention is required by law
                </p>
              </div>
            </div>
          </section>

          {/* International Transfers */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Globe className="w-6 h-6 text-blue-600" />
              International Data Transfers
            </h2>
            <p className="text-gray-700 mb-4">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this policy.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                We use standard contractual clauses and other approved mechanisms for international data transfers.
              </p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <p className="text-gray-700">
                Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe we have collected information from your child, please contact us immediately.
              </p>
            </div>
          </section>

          {/* Updates to Policy */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of any material changes via email or through the Service.
            </p>
          </section>

          {/* Contact Information */}
          <section id="contact" className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-sm border border-green-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us About Privacy</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-600" />
                  English
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <a href="mailto:contact@covergen.pro" className="text-green-600 hover:text-green-700 font-medium">
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
                  <Globe className="w-5 h-5 text-green-600" />
                  中文
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">邮箱</p>
                      <a href="mailto:contact@covergen.pro" className="text-green-600 hover:text-green-700 font-medium">
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

            <div className="mt-6 p-4 bg-green-100 rounded-lg">
              <p className="text-sm text-green-800 text-center">
                We are committed to protecting your privacy and will respond to inquiries within 48 hours.
              </p>
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