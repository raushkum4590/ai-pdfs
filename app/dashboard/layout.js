import React from 'react'
import Sidebar from './_components/Sidebar'
import Header from './_components/Header'

function Dashboard({children}) {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
       {/* Modern Sidebar */}
       <div className='md:w-80 h-screen fixed z-20'>
        <Sidebar/>
        </div>
        
        {/* Main Content Area */}
        <div className='md:ml-80'>
          <Header/>
          <div className='p-8 min-h-screen'>
            <div className='max-w-7xl mx-auto'>
              {children}
            </div>
          </div>
        </div>
    </div>
  )
}

export default Dashboard