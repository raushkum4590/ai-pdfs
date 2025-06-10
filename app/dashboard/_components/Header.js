import { UserButton } from '@clerk/nextjs'
import { Search, Bell, Settings, User } from 'lucide-react'
import React from 'react'

function Header() {
  return (
    <div className='backdrop-blur-md bg-white/80 border-b border-white/20 shadow-lg'>
      <div className='flex items-center justify-between px-8 py-6'>
        {/* Enhanced Search Bar */}
        <div className='flex-1 max-w-2xl'>
          <div className='relative'>
            <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
            <input
              type='text'
              placeholder='Search your documents, ask AI anything...'
              className='w-full pl-12 pr-6 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-sm text-gray-700 placeholder-gray-400 transition-all duration-300'
            />
            <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
              <kbd className='px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg'>
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Enhanced Right Side Actions */}
        <div className='flex items-center space-x-4 ml-8'>
          {/* AI Assistant Indicator */}
          <div className='hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50'>
            <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
            <span className='text-sm font-medium text-blue-700'>AI Online</span>
          </div>
          
          {/* Notifications */}
          <button className='relative p-3 text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-2xl transition-all duration-300 group'>
            <Bell className='w-5 h-5' />
            <div className='absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center'>
              <span className='text-white text-xs font-bold'>3</span>
            </div>
          </button>
          
          {/* Settings */}
          <button className='p-3 text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-2xl transition-all duration-300'>
            <Settings className='w-5 h-5' />
          </button>
          
          {/* User Profile */}
          <div className='flex items-center pl-4 border-l border-gray-200'>
            <UserButton />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header