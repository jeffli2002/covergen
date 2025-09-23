'use client'

import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export default function SubscriptionRefreshButton() {
  const { triggerSubscriptionRefresh, triggerUsageRefresh } = useAppStore()
  
  const handleRefresh = () => {
    console.log('[SubscriptionRefreshButton] Triggering manual refresh')
    triggerSubscriptionRefresh()
    triggerUsageRefresh()
    toast.success('Subscription data refresh triggered', {
      description: 'Header and pricing components should update now'
    })
  }
  
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      className="fixed bottom-4 right-4 z-50 shadow-lg"
      title="Debug: Refresh subscription data"
    >
      <RefreshCw className="w-4 h-4 mr-2" />
      Refresh Sub
    </Button>
  )
}