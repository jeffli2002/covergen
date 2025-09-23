'use client'

import { FileText, CheckCircle2, AlertCircle, Globe, Shield, CreditCard, Scale, Mail, MapPin } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'
import { getClientSubscriptionConfig } from '@/lib/subscription-config-client'

interface TermsPageClientProps {
  locale: Locale
  translations: any
}

export default function TermsPageClient({ locale, translations: t }: TermsPageClientProps) {
  // Get configuration for dynamic values
  const config = getClientSubscriptionConfig()
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
                    <p className="text-sm font-medium text-gray-900 mb-2">$0/forever</p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>✓ {config.limits.free.monthly} covers per month</li>
                      <li>✓ {config.limits.free.daily} covers per day max</li>
                      <li>✓ No watermark</li>
                      <li>✓ All platform sizes</li>
                      <li>✓ Email support</li>
                      <li>✓ Personal use only</li>
                    </ul>
                  </div>
                  <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Pro Plan</h4>
                    <p className="text-sm font-medium text-gray-900 mb-2">$9/month</p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>✓ {config.limits.pro.monthly} covers per month</li>
                      <li>✓ No watermark</li>
                      <li>✓ All platform sizes</li>
                      <li>✓ Priority support</li>
                      <li>✓ Commercial usage rights</li>
                    </ul>
                  </div>
                  <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Pro+ Plan</h4>
                    <p className="text-sm font-medium text-gray-900 mb-2">$19/month</p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>✓ {config.limits.pro_plus.monthly} covers per month</li>
                      <li>✓ No watermark</li>
                      <li>✓ Full commercial license</li>
                      <li>✓ Custom brand templates</li>
                      <li>✓ API access</li>
                      <li>✓ Dedicated support</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">4.2 Billing & Payment Terms</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-gray-700">• <strong>Billing Cycles:</strong> Subscriptions are billed monthly or annually in advance</p>
                  <p className="text-gray-700">• <strong>Payment Methods:</strong> We accept credit cards, debit cards, PayPal, and region-specific payment methods</p>
                  <p className="text-gray-700">• <strong>Currency:</strong> Prices are displayed in USD, EUR, or CNY based on your location</p>
                  <p className="text-gray-700">• <strong>Taxes:</strong> Prices exclude applicable taxes, which will be calculated at checkout</p>
                  <p className="text-gray-700">• <strong>Failed Payments:</strong> We'll retry failed payments 3 times over 7 days before suspending service</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">4.3 Auto-Renewal</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-700 mb-2">
                    <strong>Important:</strong> All paid subscriptions automatically renew until cancelled:
                  </p>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Monthly plans renew on the same day each month</li>
                    <li>• Annual plans renew on the anniversary of your subscription date</li>
                    <li>• You'll receive an email reminder 3 days before renewal</li>
                    <li>• Cancel anytime through your account settings to prevent renewal</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">4.4 Cancellation Policy</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-gray-700">• <strong>Cancel Anytime:</strong> You can cancel your subscription at any time</p>
                  <p className="text-gray-700">• <strong>Access Until End of Period:</strong> You'll retain access until the end of your current billing period</p>
                  <p className="text-gray-700">• <strong>No Partial Refunds:</strong> We don't offer refunds for partial billing periods</p>
                  <p className="text-gray-700">• <strong>Reactivation:</strong> You can reactivate your subscription anytime without losing your data</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">4.5 No Refund Policy</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-gray-700">• <strong>All Sales Final:</strong> Due to the digital nature of our service, all sales are final</p>
                  <p className="text-gray-700">• <strong>Billing Errors:</strong> We will correct any verified billing errors or duplicate charges</p>
                  <p className="text-gray-700">• <strong>Service Credits:</strong> Extended outages may be compensated with service credits at our discretion</p>
                </div>
              </div>


              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">4.7 Plan Changes</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Upgrades</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Take effect immediately</li>
                      <li>• Prorated charge for current period</li>
                      <li>• New plan rate applies at next renewal</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Downgrades</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Take effect at next billing cycle</li>
                      <li>• No refund for current period</li>
                      <li>• Feature access adjusts accordingly</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">4.8 Price Changes</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    We may adjust prices with <strong>30 days advance notice</strong> via email. You can accept the new price or cancel before it takes effect. Promotional pricing is time-limited and may not be renewed.
                  </p>
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

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">5.3 Usage Rights by Plan</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Free Plan</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Personal Use Only</strong></p>
                    <ul className="space-y-1 text-gray-600">
                      <li>✓ Personal projects</li>
                      <li>✓ Learning/educational use</li>
                      <li>✓ Non-commercial content</li>
                      <li>✓ Social media (personal)</li>
                      <li>✗ Commercial use</li>
                      <li>✗ Client work</li>
                      <li>✗ Monetized content</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Pro Plan</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Personal & Commercial Use</strong></p>
                    <ul className="space-y-1 text-gray-600">
                      <li>✓ All personal uses</li>
                      <li>✓ Commercial projects</li>
                      <li>✓ Monetized content</li>
                      <li>✓ Client work</li>
                      <li>✓ Small business use</li>
                      <li>✗ Resale/redistribution</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Pro+ Plan</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Full Commercial License</strong></p>
                    <ul className="space-y-1 text-gray-600">
                      <li>✓ All Pro features</li>
                      <li>✓ Enterprise use</li>
                      <li>✓ Team collaboration</li>
                      <li>✓ White-label rights</li>
                      <li>✓ Extended license</li>
                      <li>✓ Priority IP protection</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> Usage rights are tied to your subscription status. Free plan users are limited to personal use only. Upgrade to Pro or Pro+ for commercial usage rights. AI-generated content may include watermarks as required by law.
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">5.3 AI Generation Disclaimer</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                <p className="text-gray-700">
                  <strong>Important:</strong> CoverGen Pro uses advanced AI models to generate images based on your inputs. Please understand:
                </p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• <strong>Quality Variance:</strong> Generation results depend on prompt quality, complexity, and AI model capabilities</li>
                  <li>• <strong>No Guarantee:</strong> We cannot guarantee that every generation will meet your expectations or requirements</li>
                  <li>• <strong>Network Dependencies:</strong> Service quality may be affected by internet connectivity and server availability</li>
                  <li>• <strong>AI Limitations:</strong> AI models may occasionally produce unexpected, incorrect, or unsuitable results</li>
                  <li>• <strong>Iteration Expected:</strong> Multiple attempts may be needed to achieve desired results</li>
                </ul>
                <p className="text-gray-700 text-sm mt-3">
                  <strong>By using our Service, you acknowledge these inherent limitations of AI technology and accept that results may vary.</strong>
                </p>
              </div>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">9.1 Service Availability & Performance</h3>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    The Service is provided "AS IS" and "AS AVAILABLE". We do not guarantee:
                  </p>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Uninterrupted or error-free operation of the Service</li>
                    <li>• Consistent AI generation quality or success rates</li>
                    <li>• Specific generation times or performance levels</li>
                    <li>• Availability during high traffic periods or maintenance</li>
                    <li>• Compatibility with all network conditions or devices</li>
                  </ul>
                  <div className="mt-3 p-3 bg-amber-100 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>Network Notice:</strong> Service performance depends on your internet connection quality, regional server availability, and third-party AI service providers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">9.2 AI-Specific Disclaimers</h3>
                <div className="space-y-3">
                  <p className="text-gray-700 font-semibold">We specifically disclaim liability for:</p>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• AI-generated content that doesn't meet your expectations</li>
                    <li>• Failed generations due to prompt complexity or AI limitations</li>
                    <li>• Variations in output quality between generations</li>
                    <li>• Time delays in generation due to server load or network issues</li>
                    <li>• Inability to generate specific styles or concepts</li>
                    <li>• Content that may require multiple iterations to achieve desired results</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">9.3 Limitation of Liability</h3>
                <p className="text-gray-700 mb-3">
                  To the fullest extent permitted by law, CoverGen Pro shall not be liable for:
                </p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Any indirect, incidental, special, or consequential damages</li>
                  <li>• Lost profits, revenue, or business opportunities</li>
                  <li>• Costs of procuring substitute services</li>
                  <li>• Damages resulting from AI generation failures or quality issues</li>
                  <li>• Any damages exceeding the fees paid by you in the past 12 months</li>
                </ul>
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
                        Datun Road, Chaoyang District<br />
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
                        中国北京市朝阳区大屯路
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