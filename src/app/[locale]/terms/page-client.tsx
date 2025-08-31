'use client'

import { FileText, CheckCircle2, AlertCircle, Globe, Shield, CreditCard, Scale, Mail, MapPin } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'

interface TermsPageClientProps {
  locale: Locale
  translations: any
}

export default function TermsPageClient({ locale, translations: t }: TermsPageClientProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <p className="text-lg">Effective Date: August 31, 2025</p>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-blue-50 rounded-2xl p-6 mb-12 border border-blue-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            Quick Navigation
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a href="#accounts" className="text-blue-600 hover:text-blue-700 hover:underline text-sm">User Accounts</a>
            <a href="#subscription" className="text-blue-600 hover:text-blue-700 hover:underline text-sm">Subscription & Payment</a>
            <a href="#content" className="text-blue-600 hover:text-blue-700 hover:underline text-sm">Content & Licensing</a>
            <a href="#acceptable-use" className="text-blue-600 hover:text-blue-700 hover:underline text-sm">Acceptable Use</a>
            <a href="#privacy" className="text-blue-600 hover:text-blue-700 hover:underline text-sm">Privacy</a>
            <a href="#liability" className="text-blue-600 hover:text-blue-700 hover:underline text-sm">Liability</a>
            <a href="#termination" className="text-blue-600 hover:text-blue-700 hover:underline text-sm">Termination</a>
            <a href="#contact" className="text-blue-600 hover:text-blue-700 hover:underline text-sm">Contact Us</a>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Section 1: Introduction */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">
                By accessing or using CoverGen Pro ("Service", "Platform", or "We"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you do not have permission to access our Service.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    <strong>Important:</strong> These Terms constitute a legally binding agreement between you and CoverGen Pro. Please read them carefully.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Service Description */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Our Service</h2>
            <p className="text-gray-700 mb-6">
              CoverGen Pro is an AI-powered platform that enables users to create professional cover images and posters for various content platforms including:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Supported Platforms</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• YouTube thumbnails</li>
                  <li>• TikTok covers</li>
                  <li>• Spotify album art</li>
                  <li>• Twitch banners</li>
                  <li>• Social media posts</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Key Features</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• AI-powered generation</li>
                  <li>• Custom templates</li>
                  <li>• Image editing tools</li>
                  <li>• Multi-language support</li>
                  <li>• Commercial usage rights</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: User Accounts */}
          <section id="accounts" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-600" />
              3. User Accounts
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">3.1 Account Registration</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>You must provide accurate and complete information during registration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>You must be at least 13 years old to create an account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>One person or legal entity may maintain only one free account</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">3.2 Account Security</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-700">
                    You are responsible for:
                  </p>
                  <ul className="mt-2 space-y-1 text-gray-700 text-sm">
                    <li>• Maintaining the confidentiality of your account credentials</li>
                    <li>• All activities that occur under your account</li>
                    <li>• Notifying us immediately of any unauthorized access</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Subscription & Payment */}
          <section id="subscription" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-blue-600" />
              4. Subscription Plans & Payment
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">4.1 Available Plans</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Free Plan</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>✓ 3 generations daily</li>
                      <li>✓ Basic features</li>
                      <li>✓ Community support</li>
                    </ul>
                  </div>
                  <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Pro Plan</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>✓ 100 generations monthly</li>
                      <li>✓ Advanced features</li>
                      <li>✓ Priority support</li>
                    </ul>
                  </div>
                  <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Pro+ Plan</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>✓ Unlimited generations</li>
                      <li>✓ All features</li>
                      <li>✓ API access</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">4.2 Payment Terms</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-gray-700">• Subscriptions are billed monthly or annually in advance</p>
                  <p className="text-gray-700">• Prices are subject to change with 30 days notice</p>
                  <p className="text-gray-700">• All fees are non-refundable except as required by law</p>
                  <p className="text-gray-700">• Failed payments may result in service suspension</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Content & Licensing */}
          <section id="content" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Content Rights & Licensing</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">5.1 Your Content</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-gray-700 text-sm">
                    <strong>You retain all rights</strong> to content you upload. We only use your content to provide our services to you.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">5.2 Generated Content</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-700 text-sm">
                    <strong>You own all generated images</strong>, subject to compliance with applicable laws and these Terms.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> AI-generated content may include watermarks as required by law. You must have rights to any input content used in generation.
              </p>
            </div>
          </section>

          {/* Section 6: Acceptable Use */}
          <section id="acceptable-use" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Acceptable Use Policy</h2>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-red-900 mb-3">Prohibited Uses</h3>
              <p className="text-gray-700 mb-3">You may NOT use our Service to:</p>
              <ul className="space-y-2 text-gray-700">
                <li>❌ Generate illegal, harmful, or abusive content</li>
                <li>❌ Create misleading or deceptive materials</li>
                <li>❌ Violate third-party intellectual property rights</li>
                <li>❌ Bypass service limitations or security measures</li>
                <li>❌ Use automated systems without permission</li>
                <li>❌ Engage in any activity that disrupts our Service</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Permitted Uses</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✅ Create content for personal or commercial projects</li>
                <li>✅ Generate images for your social media channels</li>
                <li>✅ Design covers for your creative works</li>
                <li>✅ Use generated content in compliance with platform policies</li>
              </ul>
            </div>
          </section>

          {/* Section 7: Intellectual Property */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                The CoverGen Pro service, including its design, features, and technology, is protected by intellectual property laws. All rights not expressly granted to you are reserved by us.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  Our trademarks, logos, and brand features may not be used without our prior written permission.
                </p>
              </div>
            </div>
          </section>

          {/* Section 8: Privacy */}
          <section id="privacy" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Privacy & Data Protection</h2>
            <p className="text-gray-700 mb-4">
              Your privacy is important to us. Our use of your personal information is governed by our Privacy Policy.
            </p>
            <a href={`/${locale}/privacy`} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
              View Privacy Policy
              <span className="text-sm">→</span>
            </a>
          </section>

          {/* Section 9: Disclaimers & Liability */}
          <section id="liability" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Disclaimers & Limitations</h2>
            
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">9.1 Service Availability</h3>
                <p className="text-gray-700">
                  The Service is provided "AS IS" and "AS AVAILABLE". We do not guarantee uninterrupted or error-free operation.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">9.2 Limitation of Liability</h3>
                <p className="text-gray-700">
                  To the fullest extent permitted by law, CoverGen Pro shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.
                </p>
              </div>
            </div>
          </section>

          {/* Section 10: Indemnification */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnification</h2>
            <p className="text-gray-700">
              You agree to indemnify and hold harmless CoverGen Pro, its affiliates, and their respective officers, directors, employees, and agents from any claims, damages, or expenses arising from:
            </p>
            <ul className="mt-3 space-y-1 text-gray-700">
              <li>• Your use of the Service</li>
              <li>• Your violation of these Terms</li>
              <li>• Your violation of any third-party rights</li>
            </ul>
          </section>

          {/* Section 11: Termination */}
          <section id="termination" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Termination</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">By You</h3>
                <p className="text-gray-700 text-sm">
                  You may terminate your account at any time through your account settings.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">By Us</h3>
                <p className="text-gray-700 text-sm">
                  We may suspend or terminate your account for violations of these Terms.
                </p>
              </div>
            </div>
          </section>

          {/* Section 12: Changes to Terms */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Modifications to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these Terms at any time. Material changes will be notified via email or through the Service. Continued use after modifications constitutes acceptance.
            </p>
          </section>

          {/* Section 13: Governing Law */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Scale className="w-6 h-6 text-blue-600" />
              13. Governing Law & Disputes
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-gray-700 mb-3">
                These Terms are governed by the laws of <strong>Hong Kong Special Administrative Region</strong>.
              </p>
              <p className="text-gray-700">
                Any disputes shall be subject to the exclusive jurisdiction of the courts of Hong Kong.
              </p>
            </div>
          </section>

          {/* Section 14: Contact Information */}
          <section id="contact" className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">14. Contact Us</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  English
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <a href="mailto:contact@covergen.pro" className="text-blue-600 hover:text-blue-700 font-medium">
                        contact@covergen.pro
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="text-gray-900">
                        CoverGen Pro, Legal Department<br />
                        Beijing, China
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  中文
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">邮箱</p>
                      <a href="mailto:contact@covergen.pro" className="text-blue-600 hover:text-blue-700 font-medium">
                        contact@covergen.pro
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">地址</p>
                      <p className="text-gray-900">
                        CoverGen Pro 法务部门<br />
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