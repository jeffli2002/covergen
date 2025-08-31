'use client'

import { Cookie } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'

interface CookiesPageClientProps {
  locale: Locale
  translations: any
}

export default function CookiesPageClient({ locale, translations: t }: CookiesPageClientProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Cookie className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-gray-600">Last updated: August 31, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-8 prose prose-gray max-w-none">
          <h2>Introduction</h2>
          <p>
            This Cookie Policy explains how CoverImage AI ("we," "us," or "our") uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
          </p>

          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
          </p>

          <h2>Why Do We Use Cookies?</h2>
          <p>We use cookies for several reasons:</p>
          
          <h3>Essential Cookies</h3>
          <p>
            These cookies are strictly necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you such as logging in, setting your privacy preferences, or filling in forms.
          </p>

          <h3>Performance and Analytics Cookies</h3>
          <p>
            These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us understand which pages are the most and least popular and see how visitors move around the site.
          </p>

          <h3>Functionality Cookies</h3>
          <p>
            These cookies enable the website to provide enhanced functionality and personalization, such as remembering your language preference or region.
          </p>

          <h2>Types of Cookies We Use</h2>
          
          <h3>First-Party Cookies</h3>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left">Cookie Name</th>
                <th className="text-left">Purpose</th>
                <th className="text-left">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>auth_token</td>
                <td>User authentication</td>
                <td>Session</td>
              </tr>
              <tr>
                <td>user_preferences</td>
                <td>Stores user settings</td>
                <td>1 year</td>
              </tr>
              <tr>
                <td>locale</td>
                <td>Language preference</td>
                <td>1 year</td>
              </tr>
              <tr>
                <td>cookie_consent</td>
                <td>Cookie consent status</td>
                <td>1 year</td>
              </tr>
            </tbody>
          </table>

          <h3>Third-Party Cookies</h3>
          <p>We may also use third-party services that set cookies on our behalf:</p>
          <ul>
            <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
            <li><strong>Stripe:</strong> For secure payment processing (only on payment pages)</li>
            <li><strong>Cloudflare:</strong> For security and performance optimization</li>
          </ul>

          <h2>How Can You Control Cookies?</h2>
          <p>
            You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager. You can also set or amend your web browser controls to accept or refuse cookies.
          </p>

          <h3>Browser Controls</h3>
          <p>
            Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set, visit:
          </p>
          <ul>
            <li><a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.aboutcookies.org</a></li>
            <li><a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.allaboutcookies.org</a></li>
          </ul>

          <h3>Disabling Cookies</h3>
          <p>
            You can prevent the setting of cookies by adjusting the settings on your browser. Be aware that disabling cookies will affect the functionality of this and many other websites that you visit. Disabling cookies will usually result in also disabling certain functionality and features of this site.
          </p>

          <h2>Changes to This Cookie Policy</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons. Please revisit this Cookie Policy regularly to stay informed about our use of cookies.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about our use of cookies or other technologies, please contact us at:
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