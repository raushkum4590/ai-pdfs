"use client"
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import { useState, useEffect } from 'react'

export default function SimplePayPalTest() {
  const [sdkReady, setSdkReady] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  useEffect(() => {
    console.log('=== PayPal Debug Info ===')
    console.log('Client ID:', clientId)
    console.log('Client ID Type:', typeof clientId)
    console.log('Client ID Length:', clientId?.length)
    console.log('========================')
  }, [clientId])

  const createOrder = (data, actions) => {
    console.log('Creating order...')
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: "1.00"
        }
      }]
    })
  }

  const onApprove = async (data, actions) => {
    console.log('Payment approved:', data)
    const details = await actions.order.capture()
    console.log('Payment captured:', details)
    setSuccess(true)
  }

  const onError = (err) => {
    console.error('PayPal Error:', err)
    setError(err.message || 'Unknown PayPal error')
  }

  const onCancel = (data) => {
    console.log('Payment cancelled:', data)
  }

  const onScriptLoad = () => {
    console.log('PayPal SDK loaded!')
    setSdkReady(true)
  }

  const onScriptError = (err) => {
    console.error('PayPal SDK Error:', err)
    setError('Failed to load PayPal SDK')
  }

  if (!clientId) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">PayPal Test - No Client ID</h1>
        <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded">
          PayPal Client ID is not set in environment variables.
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Simple PayPal Test</h1>
      
      <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-6">
        <h3 className="font-bold mb-2">Debug Information:</h3>
        <p>Client ID: {clientId.substring(0, 20)}...</p>
        <p>SDK Ready: {sdkReady ? 'Yes' : 'No'}</p>
        <p>Error: {error || 'None'}</p>
        <p>Success: {success ? 'Yes' : 'No'}</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded mb-6">
          Error: {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-300 text-green-800 p-4 rounded mb-6">
          Payment successful!
        </div>
      )}

      <div className="bg-white border border-gray-200 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Test Payment - $1.00</h2>
        
        <PayPalScriptProvider
          options={{
            clientId: clientId,
            currency: "USD",
            intent: "capture"
          }}
          onLoadScript={onScriptLoad}
          onError={onScriptError}
        >
          {sdkReady ? (
            <PayPalButtons
              createOrder={createOrder}
              onApprove={onApprove}
              onError={onError}
              onCancel={onCancel}
            />
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Loading PayPal...</p>
            </div>
          )}
        </PayPalScriptProvider>
      </div>
    </div>
  )
}
