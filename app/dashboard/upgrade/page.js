"use client"
import { Check, Star, Zap, Crown, Sparkles, Shield, Infinity } from 'lucide-react'
import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

const SHADOW = '4px 4px 0 #000'
const SHADOW_LG = '6px 6px 0 #000'

const HALFTONE = {
  backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.07) 1.5px, transparent 1.5px)',
  backgroundSize: '20px 20px',
}

export default function UpgradePage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [stripeError] = useState(null)

  const stripePaymentUrl = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_URL || 'https://buy.stripe.com/test_5kQcMX61X4sJ6IY6JU9Ve01'

  const subscription = useQuery(api.subscriptions.getUserSubscription, {
    userEmail: user?.primaryEmailAddress?.emailAddress || ''
  })
  const createSubscriptionMutation = useMutation(api.subscriptions.createOrUpdateSubscription)

  const handleStripePayment = () => {
    const url = new URL(stripePaymentUrl)
    if (user?.primaryEmailAddress?.emailAddress)
      url.searchParams.set('prefilled_email', user.primaryEmailAddress.emailAddress)
    url.searchParams.set('success_url', `${window.location.origin}/dashboard?upgraded=true`)
    url.searchParams.set('cancel_url', `${window.location.origin}/dashboard/upgrade`)
    window.open(url.toString(), '_blank')
  }

  const handleMockPayment = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/mock-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user?.primaryEmailAddress?.emailAddress, planType: 'pro' })
      })
      const result = await res.json()
      if (result.success) {
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
        setTimeout(() => {
          alert('Demo upgrade successful!')
          window.location.href = '/dashboard?upgraded=true'
        }, 2000)
      } else throw new Error(result.error)
    } catch (err) {
      setLoading(false)
      alert('Demo payment failed: ' + err.message)
    }
  }

  const isPro = subscription?.status === 'active'

  return (
    <div className='min-h-screen bg-yellow-50 p-6 md:p-10' style={HALFTONE}>

      {/* Loading overlay */}
      {loading && (
        <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50'>
          <div className='bg-white border-4 border-black rounded-2xl p-8 flex items-center gap-4' style={{ boxShadow: SHADOW_LG }}>
            <div className='w-10 h-10 border-4 border-black border-t-yellow-400 rounded-full animate-spin' />
            <span className='font-black text-black uppercase'>Processing...</span>
          </div>
        </div>
      )}

      {/* Success overlay */}
      {success && (
        <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50'>
          <div className='bg-green-400 border-4 border-black rounded-2xl p-10 text-center max-w-sm mx-4' style={{ boxShadow: SHADOW_LG }}>
            <div className='w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-4'>
              <Check className='w-10 h-10 text-green-400' />
            </div>
            <h3 className='text-3xl font-black text-black uppercase mb-2'>Welcome to Pro!</h3>
            <p className='text-black font-bold mb-4'>Redirecting to dashboard...</p>
            <div className='font-black text-black animate-bounce uppercase text-sm'>Unlocking features...</div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className='text-center mb-12 max-w-3xl mx-auto'>
        <div className='inline-flex items-center gap-2 bg-black text-yellow-400 font-black text-sm uppercase px-5 py-2 rounded-full mb-5'>
          <Sparkles className='w-4 h-4' /> Unlock Premium Features
        </div>
        <h1 className='text-5xl md:text-6xl font-black text-black uppercase leading-tight mb-4'>
          Choose Your<br />
          <span className='bg-yellow-400 px-3'>Perfect Plan</span>
        </h1>
        <p className='text-gray-700 font-medium text-lg'>
          Upgrade for unlimited PDF uploads, advanced AI analysis, and premium features.
        </p>
      </div>

      {/* Plan cards */}
      <div className='max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12'>

        {/* Starter */}
        <div className='bg-white border-4 border-black rounded-3xl p-8 hover:-translate-y-1 transition-transform' style={{ boxShadow: SHADOW_LG }}>
          <div className='text-center mb-8'>
            <div className='w-16 h-16 bg-gray-100 border-3 border-black rounded-2xl flex items-center justify-center mx-auto mb-4'
              style={{ border: '3px solid #000', boxShadow: SHADOW }}>
              <Shield className='w-8 h-8 text-black' />
            </div>
            <h2 className='text-3xl font-black text-black uppercase mb-1'>Starter</h2>
            <p className='text-gray-500 font-medium mb-4'>Perfect for getting started</p>
            <div className='flex items-baseline justify-center gap-1'>
              <span className='text-6xl font-black text-black'>$0</span>
              <span className='text-gray-500 font-bold'>/month</span>
            </div>
          </div>

          <ul className='space-y-3 mb-8'>
            {[
              'Up to 10 PDF uploads',
              'Basic AI analysis',
              'Standard chat interface',
              'Email support',
              'Help center access',
            ].map((item) => (
              <li key={item} className='flex items-center gap-3'>
                <div className='w-6 h-6 bg-green-400 border-2 border-black rounded-full flex items-center justify-center flex-shrink-0'
                  style={{ boxShadow: '1px 1px 0 #000' }}>
                  <Check className='w-3.5 h-3.5 text-black' />
                </div>
                <span className='text-gray-700 font-medium'>{item}</span>
              </li>
            ))}
          </ul>

          <button className='w-full bg-gray-200 text-black font-black py-3 rounded-xl border-2 border-black uppercase cursor-default'
            style={{ boxShadow: SHADOW }}>
            Current Plan
          </button>
        </div>

        {/* Pro */}
        <div className='bg-blue-600 border-4 border-black rounded-3xl p-8 relative hover:-translate-y-1 transition-transform' style={{ boxShadow: SHADOW_LG }}>
          {/* Most popular badge */}
          <div className='absolute -top-5 left-1/2 -translate-x-1/2'>
            <div className='bg-yellow-400 border-3 border-black rounded-full px-5 py-1.5 flex items-center gap-2'
              style={{ border: '3px solid #000', boxShadow: SHADOW }}>
              <Crown className='w-4 h-4 text-black' />
              <span className='font-black text-black uppercase text-xs'>Most Popular</span>
            </div>
          </div>

          <div className='text-center mb-8 pt-4'>
            <div className='w-16 h-16 bg-yellow-400 border-3 border-black rounded-2xl flex items-center justify-center mx-auto mb-4'
              style={{ border: '3px solid #000', boxShadow: SHADOW }}>
              <Zap className='w-8 h-8 text-black' />
            </div>
            <h2 className='text-3xl font-black text-white uppercase mb-1'>Pro</h2>
            <p className='text-blue-200 font-medium mb-4'>For power users & professionals</p>
            <div className='flex items-baseline justify-center gap-1'>
              <span className='text-6xl font-black text-white'>$9.99</span>
              <span className='text-blue-200 font-bold'>/month</span>
            </div>
            <span className='inline-block mt-2 bg-green-400 border-2 border-black text-black text-xs font-black px-3 py-1 rounded-full'
              style={{ boxShadow: '2px 2px 0 #000' }}>
              Save 20% with annual billing
            </span>
          </div>

          <ul className='space-y-3 mb-8'>
            {[
              ['Unlimited PDF uploads', true],
              ['Advanced AI analysis', true],
              ['Priority processing & fast responses', true],
              ['Advanced chat features & templates', true],
              ['24/7 priority support', true],
              ['Export & sharing capabilities', true],
              ['API access for integrations', true],
            ].map(([item]) => (
              <li key={item} className='flex items-center gap-3'>
                <div className='w-6 h-6 bg-yellow-400 border-2 border-black rounded-full flex items-center justify-center flex-shrink-0'
                  style={{ boxShadow: '1px 1px 0 #000' }}>
                  <Check className='w-3.5 h-3.5 text-black' />
                </div>
                <span className='text-white font-medium'>{item}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          {isPro ? (
            <div className='w-full bg-green-400 border-2 border-black rounded-xl py-4 text-center font-black text-black uppercase'
              style={{ boxShadow: SHADOW }}>
              You're Pro! Active until {subscription?.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString() : '—'}
            </div>
          ) : success ? (
            <div className='w-full bg-green-400 border-2 border-black rounded-xl py-4 text-center font-black text-black uppercase'
              style={{ boxShadow: SHADOW }}>
              Successfully Upgraded!
            </div>
          ) : (
            <div className='space-y-3'>
              {stripeError && (
                <div className='bg-red-400 border-2 border-black rounded-xl py-3 px-4 text-center text-black font-bold text-sm'>
                  {stripeError}
                </div>
              )}
              <button
                onClick={handleStripePayment}
                disabled={loading}
                className='w-full bg-yellow-400 text-black font-black py-4 rounded-xl border-2 border-black uppercase text-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform disabled:opacity-50'
                style={{ boxShadow: SHADOW }}>
                <Crown className='w-5 h-5' />
                Upgrade with Stripe
              </button>
              <div className='text-center'>
                <span className='text-blue-200 text-xs font-medium'>or </span>
                <button
                  onClick={handleMockPayment}
                  disabled={loading}
                  className='text-yellow-300 underline text-xs font-black uppercase hover:text-yellow-400 transition-colors'>
                  Try Demo (No charge)
                </button>
              </div>
            </div>
          )}

          <p className='text-blue-200 text-xs text-center mt-4 font-medium'>
            Secure payment · Cancel anytime · 30-day money-back
          </p>
        </div>
      </div>

      {/* Why upgrade */}
      <div className='max-w-4xl mx-auto'>
        <div className='bg-white border-4 border-black rounded-3xl overflow-hidden' style={{ boxShadow: SHADOW_LG }}>
          <div className='bg-black px-8 py-4'>
            <h3 className='text-xl font-black text-yellow-400 uppercase'>Why Upgrade to Pro?</h3>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-black'>
            {[
              { icon: <Infinity className='w-7 h-7' />, bg: 'bg-blue-500', title: 'Unlimited Access', desc: 'Upload and analyze as many PDFs as you need — no restrictions.' },
              { icon: <Zap className='w-7 h-7' />, bg: 'bg-yellow-400', title: 'Lightning Fast', desc: 'Priority processing for faster AI responses and analysis.' },
              { icon: <Star className='w-7 h-7' />, bg: 'bg-green-400', title: 'Premium Support', desc: '24/7 priority support from our expert team.' },
            ].map(({ icon, bg, title, desc }) => (
              <div key={title} className='p-8 text-center hover:bg-yellow-50 transition-colors'>
                <div className={`w-14 h-14 ${bg} border-3 border-black rounded-2xl flex items-center justify-center text-black mx-auto mb-4`}
                  style={{ border: '3px solid #000', boxShadow: SHADOW }}>
                  {icon}
                </div>
                <h4 className='text-lg font-black text-black uppercase mb-2'>{title}</h4>
                <p className='text-gray-600 font-medium text-sm'>{desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
