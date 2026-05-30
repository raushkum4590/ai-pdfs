import { UserButton } from '@clerk/nextjs'
import { Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function WorkspaceHeader({ fileInfo }) {
  return (
    <div className='bg-white border-b-4 border-black flex items-center justify-between px-5 py-3 flex-shrink-0'
      style={{ boxShadow: '0 4px 0 0 #000' }}>

      {/* Left: logo + back */}
      <div className='flex items-center gap-3'>
        <Link href='/dashboard'>
          <button className='flex items-center gap-1.5 bg-yellow-400 border-2 border-black rounded-xl px-3 py-1.5 text-black font-black text-xs uppercase hover:-translate-y-0.5 transition-transform'
            style={{ boxShadow: '2px 2px 0 #000' }}>
            <ArrowLeft className='w-3.5 h-3.5' />
            Dashboard
          </button>
        </Link>

        <div className='hidden sm:flex items-center gap-2 bg-black rounded-xl px-3 py-1.5'>
          <Sparkles className='w-4 h-4 text-yellow-400' />
          <span className='text-yellow-400 font-black text-sm uppercase'>AI PDF Chat</span>
        </div>
      </div>

      {/* Center: file name */}
      {fileInfo?.fileName && (
        <div className='hidden md:flex items-center gap-2 bg-blue-50 border-2 border-black rounded-xl px-3 py-1.5 max-w-xs'
          style={{ boxShadow: '2px 2px 0 #000' }}>
          <span className='text-xs font-black text-black uppercase truncate'>{fileInfo.fileName}</span>
        </div>
      )}

      {/* Right: AI badge + user */}
      <div className='flex items-center gap-3'>
        <div className='hidden sm:flex items-center gap-2 bg-green-400 border-2 border-black rounded-full px-3 py-1'
          style={{ boxShadow: '2px 2px 0 #000' }}>
          <div className='w-2 h-2 bg-black rounded-full animate-pulse' />
          <span className='text-[11px] font-black text-black uppercase'>Live</span>
        </div>
        <UserButton />
      </div>
    </div>
  )
}

export default WorkspaceHeader
