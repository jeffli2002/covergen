'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAppStore } from '@/lib/store'

export function usePaymentReturn() {
  const searchParams = useSearchParams()
  const { triggerSubscriptionRefresh, triggerUsageRefresh } = useAppStore()
  
  useEffect(() => {
    // Check if we're returning from a payment flow
    const fromPayment = searchParams.get('from_payment')
    const paymentStatus = searchParams.get('payment_status')
    
    if (fromPayment === 'true' || paymentStatus === 'success') {
      console.log('[usePaymentReturn] Detected return from payment, triggering refresh')
      
      // Wait a bit for webhook to process
      setTimeout(() => {
        triggerSubscriptionRefresh()
        triggerUsageRefresh()
      }, 1000)
      
      // Clean up URL params
      const url = new URL(window.location.href)
      url.searchParams.delete('from_payment')
      url.searchParams.delete('payment_status')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams, triggerSubscriptionRefresh, triggerUsageRefresh])
}