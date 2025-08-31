'use client'

import { FileText } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'

interface TermsPageClientProps {
  locale: Locale
  translations: any
}

export default function TermsPageClient({ locale, translations: t }: TermsPageClientProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: August 31, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-8 prose prose-gray max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using CoverImage AI ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            CoverImage AI provides an AI-powered platform for generating cover images and posters for various content platforms. The Service includes image generation, editing capabilities, and related features as described on our website.
          </p>

          <h2>3. User Accounts</h2>
          <h3>3.1 Registration</h3>
          <p>
            To access certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate.
          </p>
          
          <h3>3.2 Account Security</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
          </p>

          <h2>4. Subscription Plans and Payment</h2>
          <h3>4.1 Plans</h3>
          <p>We offer different subscription tiers:</p>
          <ul>
            <li><strong>Free Plan:</strong> Limited monthly generations with basic features</li>
            <li><strong>Pro Plan:</strong> Increased generation limits and advanced features</li>
            <li><strong>Pro+ Plan:</strong> Unlimited generations and priority access</li>
          </ul>

          <h3>4.2 Payment Terms</h3>
          <ul>
            <li>Subscription fees are billed in advance on a monthly or annual basis</li>
            <li>All fees are non-refundable except as required by law</li>
            <li>We reserve the right to change our pricing with 30 days' notice</li>
          </ul>

          <h2>5. User Content and Licensing</h2>
          <h3>5.1 Your Content</h3>
          <p>
            You retain all rights to the content you upload to our Service. By uploading content, you grant us a limited, non-exclusive license to process and display your content solely for the purpose of providing the Service.
          </p>

          <h3>5.2 Generated Content</h3>
          <p>
            Images generated using our Service are owned by you, subject to the following conditions:
          </p>
          <ul>
            <li>You have the necessary rights to any input content used</li>
            <li>You comply with all applicable laws and regulations</li>
            <li>You acknowledge that AI-generated content may include watermarks as required by law</li>
          </ul>

          <h2>6. Acceptable Use Policy</h2>
          <p>You agree not to use the Service to:</p>
          <ul>
            <li>Generate content that is illegal, harmful, threatening, abusive, or violates any third-party rights</li>
            <li>Create misleading or deceptive content</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Attempt to bypass any Service limitations or security measures</li>
            <li>Use automated systems or bots without our express permission</li>
          </ul>

          <h2>7. Intellectual Property</h2>
          <p>
            The Service, including its original content, features, and functionality, is owned by CoverImage AI and is protected by international copyright, trademark, and other intellectual property laws.
          </p>

          <h2>8. Privacy</h2>
          <p>
            Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.
          </p>

          <h2>9. Disclaimers and Limitations of Liability</h2>
          <h3>9.1 Service Availability</h3>
          <p>
            The Service is provided "as is" and "as available" without warranties of any kind. We do not guarantee that the Service will be uninterrupted, secure, or error-free.
          </p>

          <h3>9.2 Limitation of Liability</h3>
          <p>
            To the maximum extent permitted by law, CoverImage AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the Service.
          </p>

          <h2>10. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless CoverImage AI from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.
          </p>

          <h2>11. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the Service will cease immediately.
          </p>

          <h2>12. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify users of any material changes via email or through the Service. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
          </p>

          <h2>13. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which CoverImage AI operates, without regard to its conflict of law provisions.
          </p>

          <h2>14. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <ul>
            <li>Email: legal@coverimage.ai</li>
            <li>Address: CoverImage AI, Legal Department</li>
          </ul>
        </div>
      </div>
    </div>
  )
}