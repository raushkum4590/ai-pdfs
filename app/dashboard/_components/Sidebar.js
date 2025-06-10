"use client"
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Layout, Shield, FileText, Star, Zap, Sparkles } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import UploadPdfDialog from './UploadPdfDialog'
import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

function Sidebar() {
  const { user } = useUser();
  const path = usePathname();

  // Fetch user files based on user email
  const fileList = useQuery(api.fileStorage.GetUserFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress
  });

  // Safely calculate progress
  const uploadedFilesCount = fileList?.length || 0;
  const progressValue = (uploadedFilesCount / 10) * 100;
  return (
    <div className='bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 shadow-2xl h-screen p-6 text-white relative border-r border-slate-700/50 backdrop-blur-xl'>
      {/* Modern Logo Section */}
      <div className='flex items-center space-x-3 mb-8 p-4 bg-white/5 rounded-2xl border border-white/10'>
        <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl'>
          <Sparkles className='w-6 h-6 text-white' />
        </div>
        <div>
          <h1 className='text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>AI PDF Assistant</h1>
          <p className='text-xs text-slate-300'>Smart Document Intelligence</p>
        </div>
      </div>

      {/* Enhanced Upload Button */}
      <div className='mb-8'>
        <UploadPdfDialog isMaxFile={uploadedFilesCount >= 10}>
          <Button className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/25 rounded-xl py-3'>
            <FileText className='w-5 h-5 mr-3' />
            Upload New PDF
          </Button>
        </UploadPdfDialog>
      </div>

      {/* Modern Navigation Menu */}
      <nav className='space-y-3 mb-8'>
        <Link href={'/dashboard'}>
          <div className={`flex gap-3 items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
            path === '/dashboard' 
              ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-400/30 shadow-xl shadow-blue-500/20' 
              : 'hover:bg-white/10 hover:border-white/20 border border-transparent'
          }`}>
            <Layout className='w-5 h-5' />
            <h2 className='font-medium'>Dashboard</h2>
            {path === '/dashboard' && (
              <div className='ml-auto w-2 h-2 bg-blue-400 rounded-full animate-pulse'></div>
            )}
          </div>
        </Link>
        
        <Link href={'/dashboard/upgrade'}>
          <div className={`flex gap-3 items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
            path === '/dashboard/upgrade' 
              ? 'bg-gradient-to-r from-yellow-600/30 to-orange-600/30 border border-yellow-400/30 shadow-xl shadow-yellow-500/20' 
              : 'hover:bg-white/10 hover:border-white/20 border border-transparent'
          }`}>
            <Star className='w-5 h-5' />
            <h2 className='font-medium'>Upgrade Plan</h2>
            <div className='ml-auto'>
              <span className='bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-3 py-1 rounded-full font-bold shadow-lg'>
                PRO
              </span>
            </div>
          </div>
        </Link>
      </nav>      {/* Enhanced Usage Stats */}
      <div className='absolute bottom-6 left-6 right-6'>
        <div className='bg-gradient-to-r from-slate-800/60 to-blue-900/60 backdrop-blur-lg rounded-2xl p-5 border border-slate-600/30 shadow-2xl'>
          <div className='flex items-center justify-between mb-4'>
            <span className='text-sm font-semibold text-slate-200'>Storage Analytics</span>
            <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
              <Zap className='w-4 h-4 text-white' />
            </div>
          </div>
          
          <Progress 
            value={progressValue} 
            className='mb-4 h-3 bg-slate-700/50 rounded-full overflow-hidden'
          />
          
          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <span className='text-sm font-medium text-white'>
                {uploadedFilesCount} of 10 PDFs
              </span>
              <span className='text-xs text-blue-300 bg-blue-500/20 px-2 py-1 rounded-full'>
                {Math.round(progressValue)}%
              </span>
            </div>
            <p className='text-xs text-slate-300'>
              {uploadedFilesCount >= 10 ? '🚀 Storage Full - Time to Upgrade!' : `✨ ${10 - uploadedFilesCount} slots remaining`}
            </p>
          </div>
          
          {uploadedFilesCount >= 8 && (
            <div className='mt-4 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-xl'>
              <div className='flex items-center space-x-2'>
                <Star className='w-4 h-4 text-yellow-400' />
                <p className='text-xs text-yellow-300 font-medium'>
                  Upgrade for unlimited storage & premium features
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
