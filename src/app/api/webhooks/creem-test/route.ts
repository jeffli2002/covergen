import { NextRequest, NextResponse } from 'next/server'

// Test endpoint to log all incoming Creem webhooks
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const headers = Object.fromEntries(req.headers.entries())
    const event = JSON.parse(rawBody)
    
    console.log('=== CREEM WEBHOOK TEST ===')
    console.log('Headers:', JSON.stringify(headers, null, 2))
    console.log('Event Type:', event.eventType || event.type || 'UNKNOWN')
    console.log('Event ID:', event.id)
    console.log('Full Event:', JSON.stringify(event, null, 2))
    console.log('=========================')
    
    // Log specific fields based on event type
    const eventType = event.eventType || event.type
    if (eventType === 'checkout.completed') {
      console.log('Checkout Data:')
      console.log('- Customer ID:', event.object?.customer?.id)
      console.log('- Customer Email:', event.object?.customer?.email)
      console.log('- Subscription ID:', event.object?.subscription?.id)
      console.log('- Metadata:', event.object?.metadata)
    } else if (eventType?.includes('subscription')) {
      console.log('Subscription Data:')
      console.log('- Subscription ID:', event.object?.id)
      console.log('- Customer:', event.object?.customer)
      console.log('- Product:', event.object?.product)
      console.log('- Status:', event.object?.status)
      console.log('- Metadata:', event.object?.metadata)
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook test error:', error)
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 })
  }
}