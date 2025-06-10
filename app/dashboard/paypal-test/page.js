"use client"
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import React, { useState, useEffect } from 'react'

export default function PayPalTest() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sdkReady, setSdkReady] = useState(false)
  
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  useEffect(() => {
    if (!clientId || clientId === 'test') {
      setMessage('❌ PayPal Client ID is not properly configured. Please check your environment variables.')
    }
  }, [clientId])
  const createOrder = (data, actions) => {
    try {
      setLoading(true)
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: "9.99"
          }
        }]
      })
    } catch (error) {
      setLoading(false)
      setMessage(`❌ Error creating order: ${error.message}`)
      console.error('Create order error:', error)
      throw error
    }
  }

  const onApprove = async (data, actions) => {
    try {
      const details = await actions.order.capture()
      setLoading(false)
      setMessage(`✅ Transaction completed by ${details.payer.name.given_name}! Order ID: ${details.id}`)
      console.log('Payment details:', details)
      return details
    } catch (error) {
      setLoading(false)
      setMessage(`❌ Error capturing payment: ${error.message}`)
      console.error('Payment capture error:', error)
      throw error
    }
  }

  const onError = (err) => {
    setLoading(false)
    const errorMessage = err?.message || 'Unknown PayPal error occurred'
    setMessage(`❌ PayPal Error: ${errorMessage}`)
    console.error('PayPal SDK error:', err)
  }

  const onCancel = (data) => {
    setLoading(false)
    setMessage('⚠️ Payment was cancelled by user')
    console.log('Payment cancelled:', data)
  }

  const onScriptLoad = () => {
    setSdkReady(true)
    console.log('PayPal SDK loaded successfully')
  }

  const onScriptError = (err) => {
    setSdkReady(false)
    setMessage(`❌ Failed to load PayPal SDK: ${err.message}`)
    console.error('PayPal SDK load error:', err)
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8'>
      <div className='max-w-2xl mx-auto'>
        <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20'>
          <h1 className='text-4xl font-bold text-gray-900 mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
            PayPal Integration Test
          </h1>
            <div className='bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 rounded-2xl p-6 mb-8'>
            <h3 className='font-bold text-blue-800 mb-4 flex items-center'>
              <div className='w-6 h-6 bg-blue-500 rounded-full mr-3'></div>
              Environment Status
            </h3>
            <div className='space-y-2'>
              <p className='text-sm text-blue-700 flex justify-between'>
                <strong>Client ID Status:</strong> 
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  clientId && clientId !== 'test'
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {clientId && clientId !== 'test' ? '✅ Configured' : '❌ Missing/Invalid'}
                </span>
              </p>
              <p className='text-sm text-blue-700'>
                <strong>Current ID:</strong> {clientId && clientId !== 'test' ? 
                  `${clientId.substring(0, 20)}...` : 
                  'Not properly set'
                }
              </p>
              <p className='text-sm text-blue-700 flex justify-between'>
                <strong>SDK Status:</strong> 
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  sdkReady ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {sdkReady ? '✅ Ready' : '⏳ Loading...'}
                </span>
              </p>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-2xl mb-8 border-2 ${
              message.includes('✅') 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : message.includes('❌')
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-yellow-50 border-yellow-200 text-yellow-800'
            }`}>
              <div className='font-medium'>{message}</div>
            </div>
          )}          <div className='mb-8'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-xl font-bold text-gray-900'>Test Payment</h3>
              <div className='bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-xl font-bold'>
                $9.99
              </div>
            </div>
            
            {clientId && clientId !== 'test' ? (              <PayPalScriptProvider 
                options={{
                  clientId: clientId,
                  currency: "USD",
                  intent: "capture"
                }}
                onLoadScript={onScriptLoad}
                onError={onScriptError}
              >
                <div className='bg-gray-50 rounded-2xl p-6'>                  {sdkReady ? (
                    <PayPalButtons
                      createOrder={createOrder}
                      onApprove={onApprove}
                      onError={onError}
                      onCancel={onCancel}
                      disabled={loading}
                    />
                  ) : (
                    <div className='text-center py-8'>
                      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto'></div>
                      <p className='mt-4 text-gray-600'>Loading PayPal...</p>
                    </div>
                  )}
                </div>
              </PayPalScriptProvider>
            ) : (
              <div className='bg-red-50 border-2 border-red-200 rounded-2xl p-6'>
                <div className='text-center'>
                  <div className='text-red-500 text-6xl mb-4'>⚠️</div>
                  <h4 className='text-lg font-bold text-red-800 mb-2'>PayPal Not Configured</h4>
                  <p className='text-red-700 mb-4'>
                    Please configure your PayPal Client ID to test payments.
                  </p>
                  <div className='text-sm text-red-600'>
                    Current value: <code className='bg-red-100 px-2 py-1 rounded'>{clientId || 'undefined'}</code>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className='bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200/50'>
            <h4 className='font-bold mb-4 text-gray-900 flex items-center'>
              <div className='w-5 h-5 bg-yellow-500 rounded-full mr-3'></div>
              Need a working PayPal Client ID?
            </h4>
            <ol className='text-sm text-gray-700 space-y-3'>
              <li className='flex items-start'>
                <span className='bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5'>1</span>
                Go to <a href="https://developer.paypal.com" className="text-blue-600 hover:text-blue-800 underline font-medium" target="_blank">developer.paypal.com</a>
              </li>
              <li className='flex items-start'>
                <span className='bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5'>2</span>
                Create a Sandbox application
              </li>
              <li className='flex items-start'>
                <span className='bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5'>3</span>
                Copy the Client ID from your app
              </li>
              <li className='flex items-start'>
                <span className='bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5'>4</span>
                Update your <code className='bg-gray-200 px-2 py-1 rounded font-mono text-xs'>.env.local</code> file
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
