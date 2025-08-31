'use client'

import { Shield } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'

interface PrivacyPageClientProps {
  locale: Locale
  translations: any
}

export default function PrivacyPageClient({ locale, translations: t }: PrivacyPageClientProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: August 31, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-8 prose prose-gray max-w-none">
          <h2>Introduction</h2>
          <p>
            CoverImage AI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our cover image generation service.
          </p>

          <h2>Information We Collect</h2>
          <h3>Personal Information</h3>
          <p>When you register for an account, we may collect:</p>
          <ul>
            <li>Email address</li>
            <li>Name (optional)</li>
            <li>Payment information (processed securely through third-party providers)</li>
          </ul>

          <h3>Usage Information</h3>
          <p>We automatically collect certain information when you use our service:</p>
          <ul>
            <li>Generated images and associated metadata</li>
            <li>Platform preferences and settings</li>
            <li>Usage patterns and feature interactions</li>
            <li>Device and browser information</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul>
            <li>Provide and maintain our service</li>
            <li>Process your transactions and manage subscriptions</li>
            <li>Improve and personalize your experience</li>
            <li>Send service-related communications</li>
            <li>Ensure compliance with our terms of service</li>
            <li>Protect against fraudulent or illegal activity</li>
          </ul>

          <h2>Data Storage and Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information. Your data is stored securely using industry-standard encryption methods. Generated images are stored in secure cloud storage with access controls.
          </p>

          <h2>Data Sharing and Disclosure</h2>
          <p>We do not sell, trade, or rent your personal information. We may share your information only in the following circumstances:</p>
          <ul>
            <li>With your explicit consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights, privacy, safety, or property</li>
            <li>With service providers who assist in operating our service (under strict confidentiality agreements)</li>
          </ul>

          <h2>Your Rights and Choices</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access and receive a copy of your personal data</li>
            <li>Update or correct your information</li>
            <li>Delete your account and associated data</li>
            <li>Opt-out of marketing communications</li>
            <li>Export your generated images</li>
          </ul>

          <h2>Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Generated images are retained according to your subscription plan and can be deleted at your request.
          </p>

          <h2>International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this privacy policy.
          </p>

          <h2>Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <ul>
            <li>Email: privacy@coverimage.ai</li>
            <li>Address: CoverImage AI, Privacy Department</li>
          </ul>
        </div>
      </div>
    </div>
  )
}