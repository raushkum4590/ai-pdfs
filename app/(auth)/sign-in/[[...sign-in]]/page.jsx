'use client'
import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className='flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
      <div className='bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20'>
        <h1 className="text-2xl font-bold mb-4 text-center">Sign In to AI PDF Assistant</h1>
        <SignIn />
      </div>
    </div>
  )
}
