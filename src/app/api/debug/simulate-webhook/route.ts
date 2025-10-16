import { NextRequest, NextResponse } from 'next/server'
import { creemService } from '@/services/payment/creem'
import { env } from '@/env'

export const dynamic = 'force-dynamic'

const logs: string[] = []

const originalConsoleLog = console.log
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

function captureLog(level: string, ...args: any[]) {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ')
  
  logs.push(`[${level}] ${message}`)
  
  if (level === 'ERROR') {
    originalConsoleError(...args)
  } else if (level === 'WARN') {
    originalConsoleWarn(...args)
  } else {
    originalConsoleLog(...args)
  }
}

export async function POST(req: NextRequest) {
  logs.length = 0
  
  console.log = (...args) => captureLog('LOG', ...args)
  console.error = (...args) => captureLog('ERROR', ...args)
  console.warn = (...args) => captureLog('WARN', ...args)

  try {
    const body = await req.json()
    
    if (body.testPlanExtraction) {
      const productId = body.productId
      
      captureLog('LOG', '=== TESTING PLAN EXTRACTION ===')
      captureLog('LOG', 'Product ID:', productId)
      captureLog('LOG', 'Environment Product IDs:', {
        pro_monthly: env.NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY,
        pro_yearly: env.NEXT_PUBLIC_PRICE_ID_PRO_YEARLY,
        proplus_monthly: env.NEXT_PUBLIC_PRICE_ID_PROPLUS_MONTHLY,
        proplus_yearly: env.NEXT_PUBLIC_PRICE_ID_PROPLUS_YEARLY
      })
      
      const plan = (creemService as any).getPlanFromProduct(productId)
      
      captureLog('LOG', 'Extracted Plan:', plan)
      
      console.log = originalConsoleLog
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
      
      return NextResponse.json({
        success: true,
        extractedPlan: plan,
        productId: productId,
        logs: logs
      })
    }
    
    const { event } = body
    
    captureLog('LOG', '=== SIMULATING WEBHOOK ===')
    captureLog('LOG', 'Event Type:', event.eventType)
    captureLog('LOG', 'Full Event:', event)
    
    captureLog('LOG', '=== CALLING handleWebhookEvent ===')
    const result = await creemService.handleWebhookEvent(event)
    
    captureLog('LOG', '=== WEBHOOK HANDLER RESULT ===')
    captureLog('LOG', 'Result:', result)
    
    if (result && typeof result === 'object' && 'planId' in result) {
      captureLog('LOG', '✓ PlanId extracted successfully:', result.planId)
    } else {
      captureLog('WARN', '⚠ No planId in result')
    }
    
    console.log = originalConsoleLog
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
    
    return NextResponse.json({
      success: true,
      webhookResult: result,
      extractedValues: result && typeof result === 'object' ? {
        type: (result as any).type,
        planId: (result as any).planId,
        userId: (result as any).userId,
        customerId: (result as any).customerId,
        billingCycle: (result as any).billingCycle
      } : null,
      logs: logs,
      rawResponse: result
    })
  } catch (error: any) {
    captureLog('ERROR', 'Simulation error:', error)
    
    console.log = originalConsoleLog
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
    
    return NextResponse.json({
      success: false,
      error: error.message,
      logs: logs
    })
  }
}
