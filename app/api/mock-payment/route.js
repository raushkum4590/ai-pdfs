import { NextResponse } from 'next/server'

// Mock Stripe payment handler for demonstration purposes
export async function POST(request) {
  try {
    const { userEmail, planType } = await request.json()
    
    console.log('Mock payment received:', { userEmail, planType })
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate a mock subscription ID
    const mockSubscriptionId = `MOCK_SUB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return NextResponse.json({
      success: true,
      message: 'Mock payment successful! This is a demo.',
      subscription: {
        id: mockSubscriptionId,
        status: 'active',
        plan_id: 'MOCK_PLAN_PRO',
        subscriber: {
          email_address: userEmail
        },
        start_time: new Date().toISOString(),
        billing_info: {
          next_billing_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        }
      }
    })
    
  } catch (error) {
    console.error('Mock payment error:', error)
    return NextResponse.json({
      success: false,
      error: 'Mock payment failed'
    }, { status: 500 })
  }
}
