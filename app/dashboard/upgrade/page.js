"use client"
import { Check, Star, Zap, Crown, Sparkles, Shield, Infinity } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export default function UpgradePage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [stripeError, setStripeError] = useState(null)

  const stripePaymentUrl = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_URL || 'https://buy.stripe.com/test_5kQcMX61X4sJ6IY6JU9Ve01'
  
  useEffect(() => {
    console.log('Stripe Payment URL:', stripePaymentUrl)
  }, [stripePaymentUrl])  // Check current subscription status
  const subscription = useQuery(api.subscriptions.getUserSubscription, {
    userEmail: user?.primaryEmailAddress?.emailAddress || ""
  })
  
  const createSubscriptionMutation = useMutation(api.subscriptions.createOrUpdateSubscription)
  
  const handleStripePayment = () => {
    const url = new URL(stripePaymentUrl)
    // Add customer email to prefill the form
    if (user?.primaryEmailAddress?.emailAddress) {
      url.searchParams.set('prefilled_email', user.primaryEmailAddress.emailAddress)
    }
    
    // Add success and cancel URLs
    url.searchParams.set('success_url', `${window.location.origin}/dashboard?upgraded=true`)
    url.searchParams.set('cancel_url', `${window.location.origin}/dashboard/upgrade`)
    
    window.open(url.toString(), '_blank')
  }
  const handleMockPayment = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/mock-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userEmail: user?.primaryEmailAddress?.emailAddress,
          planType: 'pro'
        })
      })
      
      const result = await response.json()
      
      if (result.success) {        // Create subscription in Convex with mock data
        await createSubscriptionMutation({
          userEmail: user?.primaryEmailAddress?.emailAddress,
          subscriptionId: result.subscription.id,
          planId: 'MOCK_PLAN_PRO',
          status: 'active',
          startDate: new Date().toISOString(),
          stripeSubscriptionId: result.subscription.id
        })
        
        setSuccess(true)
        setLoading(false)
          // Show success message
        setTimeout(() => {
          alert('Demo upgrade successful! In a real app, this would be a Stripe transaction.')
          window.location.href = '/dashboard?upgraded=true'
        }, 2000)
      } else {
        throw new Error(result.error)
      }
      
    } catch (error) {
      console.error('Mock payment error:', error)
      setLoading(false)
      alert('Demo payment failed: ' + error.message)
    }
  }

  const onPaymentError = (err) => {
    console.error("Payment error:", err)
    setLoading(false)
    alert("Payment failed. Please try again.")
  }

  const onPaymentCancel = (data) => {
    console.log("Payment cancelled:", data)
    setLoading(false)
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8'>
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Processing payment...</span>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Pro!</h3>
            <p className="text-gray-600 mb-4">Your subscription is now active. Redirecting to dashboard...</p>
            <div className="animate-pulse text-blue-600">🚀 Unlocking premium features...</div>
          </div>
        </div>
      )}
      {/* Header Section */}
      <div className='text-center mb-12'>
        <div className='inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4'>
          <Sparkles className='w-4 h-4' />
          <span>Unlock Premium Features</span>
        </div>
        <h1 className='text-4xl font-bold text-gray-900 mb-4'>
          Choose Your Perfect Plan
        </h1>
        <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
          Upgrade to unlock unlimited PDF uploads, advanced AI analysis, and premium features designed for power users.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Free Plan */}
          <div className="relative bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Starter</h2>
              <p className="text-gray-600 mb-4">Perfect for getting started</p>
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Up to 10 PDF uploads</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Basic AI analysis</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Standard chat interface</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Email support</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Help center access</span>
              </li>
            </ul>

            <button className="w-full bg-gray-100 text-gray-800 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors">
              Current Plan
            </button>
          </div>

          {/* Pro Plan */}
          <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-300 p-8 shadow-xl hover:shadow-2xl transition-shadow">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center space-x-2">
                <Crown className="w-4 h-4" />
                <span>MOST POPULAR</span>
              </div>
            </div>

            <div className="text-center mb-8 pt-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pro</h2>
              <p className="text-gray-600 mb-4">For power users and professionals</p>
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">$9.99</span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>
              <p className="text-sm text-green-600 font-medium mt-2">Save 20% with annual billing</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700"><strong>Unlimited</strong> PDF uploads</span>
              </li>
              <li className="flex items-center">
                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700"><strong>Advanced</strong> AI analysis with GPT-4</span>
              </li>
              <li className="flex items-center">
                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700"><strong>Priority</strong> processing & faster responses</span>
              </li>
              <li className="flex items-center">
                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700"><strong>Advanced</strong> chat features & templates</span>
              </li>
              <li className="flex items-center">
                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700"><strong>24/7</strong> priority support</span>
              </li>
              <li className="flex items-center">
                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700"><strong>Export</strong> & sharing capabilities</span>
              </li>
              <li className="flex items-center">
                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700"><strong>API</strong> access for integrations</span>
              </li>
            </ul>            <div className="mb-6">
              {subscription && subscription.status === 'active' ? (
                <div className="w-full bg-green-500 text-white py-4 px-6 rounded-xl font-semibold text-lg text-center">
                  ✅ You're already subscribed to Pro!
                  <div className="text-sm mt-2 opacity-90">
                    Next billing: {subscription.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              ) : success ? (
                <div className="w-full bg-green-500 text-white py-4 px-6 rounded-xl font-semibold text-lg text-center">
                  ✅ Successfully Upgraded to Pro!
                </div>
              ) : (
                <div className="space-y-4">
                  {stripeError && (
                    <div className="w-full bg-red-100 border border-red-300 text-red-800 py-3 px-4 rounded-xl text-center text-sm">
                      ⚠️ {stripeError}
                    </div>
                  )}
                  
                  <button 
                    onClick={handleStripePayment}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Crown className="w-5 h-5" />
                        <span>Upgrade to Pro with Stripe</span>
                      </>
                    )}
                  </button>
                  
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-2">Or try our demo</div>
                    <button 
                      onClick={handleMockPayment}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-800 underline text-sm"
                    >
                      Demo Payment (No charge)
                    </button>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center">
              🔒 Secure payment • Cancel anytime • 30-day money-back guarantee
            </p>
          </div>
        </div>        {/* Features Comparison */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Why Upgrade to Pro?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Infinity className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Unlimited Access</h4>
              <p className="text-gray-600">Upload and analyze unlimited PDFs without any restrictions</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Lightning Fast</h4>
              <p className="text-gray-600">Priority processing ensures faster AI responses and analysis</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Premium Support</h4>
              <p className="text-gray-600">Get priority 24/7 support from our expert team</p>
            </div>
          </div>
        </div>        {/* Stripe Setup Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-blue-900 mb-4">💳 Stripe Payment Integration</h3>
          <p className="text-blue-800 mb-4">
            This application uses Stripe for secure payment processing:
          </p>
          <div className="bg-blue-100 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-700 mb-2">
              <strong>Current Payment URL:</strong>
            </p>
            <p className="text-xs text-blue-600 font-mono break-all">
              {stripePaymentUrl}
            </p>
          </div>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>To customize your Stripe integration:</strong></p>
            <ol className="space-y-1 ml-4">
              <li>1. Create a Stripe account at <a href="https://stripe.com" className="underline font-medium" target="_blank">stripe.com</a></li>
              <li>2. Set up your payment links or checkout sessions</li>
              <li>3. Update the <code className="bg-blue-200 px-1 rounded">NEXT_PUBLIC_STRIPE_PAYMENT_URL</code> in your .env.local file</li>
              <li>4. Configure webhooks for payment success/failure handling</li>
            </ol>
          </div>
        </div></div>
    </div>
  )
}