import { UserButton } from '@clerk/nextjs'
import { Search, Bell } from 'lucide-react'

import React from 'react'

function Header() {
  return (
    <div className='bg-white border-b-4 border-black' style={{ boxShadow: '0 4px 0 0 #000' }}>
      <div className='flex items-center justify-between px-6 py-3 gap-4'>

        {/* Search */}
        <div className='flex-1 max-w-xl relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4' />
          <input
            type='text'
            placeholder='Search documents...'
            className='w-full pl-10 pr-4 py-2.5 border-2 border-black rounded-xl bg-yellow-50 text-gray-800 placeholder-gray-400 font-medium text-sm focus:outline-none focus:ring-0 focus:border-black'
            style={{ boxShadow: '2px 2px 0 #000' }}
          />
        </div>

        {/* Right side */}
        <div className='flex items-center gap-3'>
          {/* AI status */}
          <div className='hidden md:flex items-center gap-2 bg-green-400 border-2 border-black rounded-full px-3 py-1.5'
            style={{ boxShadow: '2px 2px 0 #000' }}>
            <div className='w-2 h-2 bg-black rounded-full animate-pulse' />
            <span className='text-xs font-black text-black uppercase'>AI Online</span>
          </div>

          {/* Notifications */}
          <button className='relative w-10 h-10 bg-white border-2 border-black rounded-xl flex items-center justify-center hover:-translate-y-0.5 transition-transform'
            style={{ boxShadow: '2px 2px 0 #000' }}>
            <Bell className='w-4 h-4 text-black' />
            <span className='absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 border-2 border-black rounded-full text-white text-[9px] font-black flex items-center justify-center'>3</span>
          </button>

          {/* User */}
          <div className='border-l-2 border-black pl-3'>
            <UserButton />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
