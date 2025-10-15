'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { HelpCircle, Mail } from 'lucide-react'
import { PRICING_CONFIG } from '@/config/pricing.config'
import Link from 'next/link'

export function PricingFAQ() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <HelpCircle className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Everything you need to know about our pricing and credits system
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {PRICING_CONFIG.faq.map((item) => (
          <AccordionItem
            key={item.id}
            value={item.id}
            className="border rounded-xl px-6 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-orange-600 hover:no-underline py-5">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-gray-700 pb-5 pt-2 leading-relaxed">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Support CTA */}
      <div className="mt-12 p-8 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-100">
        <div className="text-center">
          <div className="flex justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Still have questions?</h3>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            Our support team is here to help. We typically respond within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              <Link href="mailto:support@covergen.pro">
                Contact Support
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/help">
                Visit Help Center
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
