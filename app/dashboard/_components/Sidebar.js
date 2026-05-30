"use client"
import { Layout, Star, Zap, Sparkles, FileText } from 'lucide-react'

import React from 'react'
import UploadPdfDialog from './UploadPdfDialog'
import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const SHADOW = '3px 3px 0 #000'

function Sidebar() {
  const { user } = useUser()
  const path = usePathname()

  const fileList = useQuery(api.fileStorage.GetUserFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress
  })

  const uploadedFilesCount = fileList?.length || 0
  const progressValue = (uploadedFilesCount / 10) * 100

  return (
    <div className='bg-yellow-400 border-r-4 border-black h-screen flex flex-col p-5'
      style={{ boxShadow: '4px 0 0 0 #000' }}>

      {/* Logo */}
      <div className='flex items-center gap-3 mb-6 bg-black rounded-2xl px-4 py-3'
        style={{ boxShadow: SHADOW }}>
        <div className='w-9 h-9 bg-yellow-400 border-2 border-yellow-400 rounded-xl flex items-center justify-center'>
          <Sparkles className='w-5 h-5 text-black' />
        </div>
        <div>
          <p className='text-yellow-400 font-black text-base uppercase leading-none'>AI PDF</p>
          <p className='text-yellow-600 text-[10px] font-bold uppercase tracking-wider'>Chat</p>
        </div>
      </div>

      {/* Upload button */}
      <div className='mb-6'>
        <UploadPdfDialog isMaxFile={uploadedFilesCount >= 10}>
          <button
            disabled={uploadedFilesCount >= 10}
            className='w-full bg-blue-600 text-white font-black py-3 rounded-xl border-2 border-black uppercase text-sm tracking-wide flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed'
            style={{ boxShadow: SHADOW }}>
            <FileText className='w-4 h-4' />
            Upload PDF
          </button>
        </UploadPdfDialog>
      </div>

      {/* Nav */}
      <nav className='space-y-2 flex-1'>
        {[
          { href: '/dashboard', icon: <Layout className='w-4 h-4' />, label: 'Dashboard' },
          { href: '/dashboard/upgrade', icon: <Star className='w-4 h-4' />, label: 'Upgrade', badge: 'PRO' },
        ].map(({ href, icon, label, badge }) => {
          const active = path === href
          return (
            <Link key={href} href={href}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-black font-black text-sm uppercase tracking-wide cursor-pointer transition-all hover:-translate-y-0.5 ${
                active ? 'bg-black text-yellow-400' : 'bg-white text-black hover:bg-gray-100'
              }`} style={{ boxShadow: SHADOW }}>
                {icon}
                <span>{label}</span>
                {badge && (
                  <span className='ml-auto bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-black'>
                    {badge}
                  </span>
                )}
                {active && !badge && (
                  <div className='ml-auto w-2 h-2 bg-yellow-400 rounded-full' />
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Storage panel */}
      <div className='bg-white border-2 border-black rounded-2xl p-4 mt-4' style={{ boxShadow: SHADOW }}>
        <div className='flex items-center justify-between mb-3'>
          <span className='text-xs font-black uppercase text-black'>Storage</span>
          <div className='w-7 h-7 bg-yellow-400 border-2 border-black rounded-lg flex items-center justify-center'>
            <Zap className='w-3.5 h-3.5 text-black' />
          </div>
        </div>

        <div className='w-full h-3 bg-gray-200 border-2 border-black rounded-full overflow-hidden mb-3'>
          <div
            className='h-full bg-blue-600 rounded-full transition-all duration-500'
            style={{ width: `${progressValue}%` }}
          />
        </div>

        <div className='flex justify-between items-center mb-1'>
          <span className='text-sm font-black text-black'>{uploadedFilesCount}/10 PDFs</span>
          <span className='text-xs font-bold bg-yellow-400 border border-black px-2 py-0.5 rounded-full'>
            {Math.round(progressValue)}%
          </span>
        </div>

        <p className='text-xs font-medium text-gray-600'>
          {uploadedFilesCount >= 10 ? '🚀 Full — Upgrade now!' : `${10 - uploadedFilesCount} slots remaining`}
        </p>

        {uploadedFilesCount >= 8 && (
          <Link href='/dashboard/upgrade'>
            <button className='mt-3 w-full bg-red-500 text-white font-black text-xs py-2 rounded-lg border-2 border-black uppercase hover:-translate-y-0.5 transition-transform'
              style={{ boxShadow: '2px 2px 0 #000' }}>
              Upgrade for Unlimited
            </button>
          </Link>
        )}
      </div>
    </div>
  )
}

export default Sidebar
