"use client"
import { api } from '@/convex/_generated/api'
import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import Link from 'next/link'
import React from 'react'
import { FileText, Clock, Sparkles, Calendar, Star, Upload, Zap, Brain } from 'lucide-react'

const SHADOW = '3px 3px 0 #000'
const SHADOW_LG = '5px 5px 0 #000'

function Dashboard() {
  const { user } = useUser()
  const fileList = useQuery(api.fileStorage.GetUserFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress
  })

  const getTimeAgo = (timestamp) => {
    const diffInHours = Math.floor((Date.now() - timestamp) / 3600000)
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const d = Math.floor(diffInHours / 24)
    return d < 7 ? `${d}d ago` : new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className='min-h-screen bg-yellow-50 p-6' style={{
      backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    }}>

      {/* Welcome header */}
      <div className='mb-8 flex items-start justify-between gap-4 flex-wrap'>
        <div>
          <div className='inline-flex items-center gap-2 bg-black text-yellow-400 font-black text-xs uppercase px-4 py-1.5 rounded-full mb-3'>
            <Sparkles className='w-3.5 h-3.5' /> Your Workspace
          </div>
          <h1 className='text-4xl md:text-5xl font-black text-black uppercase leading-tight'>
            Hey, {user?.firstName || 'There'}! 👋
          </h1>
          <p className='text-gray-600 font-medium mt-1'>
            {fileList?.length || 0} document{fileList?.length !== 1 ? 's' : ''} ready for AI analysis
          </p>
        </div>

        {/* AI analyses stat */}
        <div className='bg-white border-2 border-black rounded-2xl px-5 py-4 flex items-center gap-4' style={{ boxShadow: SHADOW_LG }}>
          <div className='w-12 h-12 bg-blue-600 border-2 border-black rounded-xl flex items-center justify-center'>
            <Brain className='w-6 h-6 text-white' />
          </div>
          <div>
            <p className='text-xs font-black uppercase text-gray-500'>AI Analyses</p>
            <p className='text-3xl font-black text-black'>{(fileList?.length || 0) * 3}</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8'>
        {[
          { label: 'Total Docs', value: fileList?.length || 0, suffix: '', icon: <FileText className='w-5 h-5' />, bg: 'bg-blue-500', badge: '+12% this month', badgeBg: 'bg-green-400' },
          { label: 'Time Saved', value: (fileList?.length || 0) * 2.5, suffix: 'h', icon: <Clock className='w-5 h-5' />, bg: 'bg-green-500', badge: 'AI efficiency', badgeBg: 'bg-yellow-400' },
          { label: 'Success Rate', value: 98, suffix: '%', icon: <Star className='w-5 h-5' />, bg: 'bg-purple-500', badge: 'AI accuracy', badgeBg: 'bg-red-400' },
        ].map(({ label, value, suffix, icon, bg, badge, badgeBg }) => (
          <div key={label} className='bg-white border-2 border-black rounded-2xl p-5 hover:-translate-y-1 transition-transform' style={{ boxShadow: SHADOW_LG }}>
            <div className='flex items-center justify-between mb-3'>
              <p className='text-xs font-black uppercase text-gray-500'>{label}</p>
              <div className={`w-9 h-9 ${bg} border-2 border-black rounded-xl flex items-center justify-center text-white`}
                style={{ boxShadow: '2px 2px 0 #000' }}>
                {icon}
              </div>
            </div>
            <p className='text-4xl font-black text-black mb-3'>{value}{suffix}</p>
            <span className={`${badgeBg} border-2 border-black text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full`}>
              {badge}
            </span>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

        {/* Documents panel */}
        <div className='lg:col-span-2 bg-white border-2 border-black rounded-2xl overflow-hidden' style={{ boxShadow: SHADOW_LG }}>
          <div className='flex items-center justify-between px-6 py-4 border-b-2 border-black bg-blue-600'>
            <h2 className='text-lg font-black text-white uppercase'>Your Documents</h2>
            <span className='bg-white text-blue-600 font-black text-xs px-3 py-1 rounded-full border-2 border-black'>
              {fileList?.length || 0} files
            </span>
          </div>

          <div className='p-5'>
            {fileList && fileList.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {fileList.map((file, i) => (
                  <Link key={i} href={'/workspace/' + file.fileId}>
                    <div className='group bg-yellow-50 border-2 border-black rounded-xl p-4 cursor-pointer hover:-translate-y-1 transition-all' style={{ boxShadow: SHADOW }}>
                      <div className='flex items-center gap-3'>
                        <div className='w-12 h-14 bg-red-500 border-2 border-black rounded-lg flex items-center justify-center flex-shrink-0 relative'
                          style={{ boxShadow: '2px 2px 0 #000' }}>
                          <FileText className='w-6 h-6 text-white' />
                          <div className='absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 border-2 border-black rounded-full flex items-center justify-center'>
                            <Sparkles className='w-2.5 h-2.5 text-white' />
                          </div>
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h3 className='font-black text-black text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors'>
                            {file?.fileName}
                          </h3>
                          <div className='flex items-center gap-1 text-xs text-gray-500 font-medium'>
                            <Calendar className='w-3 h-3' />
                            {getTimeAgo(file._creationTime)}
                          </div>
                        </div>
                      </div>
                      <div className='mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                        <span className='bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full border border-black uppercase'>
                          Open →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className='text-center py-14'>
                <div className='w-20 h-20 bg-yellow-400 border-3 border-black rounded-2xl flex items-center justify-center mx-auto mb-4'
                  style={{ border: '3px solid #000', boxShadow: SHADOW_LG }}>
                  <FileText className='w-10 h-10 text-black' />
                </div>
                <h3 className='text-2xl font-black text-black uppercase mb-2'>No Docs Yet!</h3>
                <p className='text-gray-600 font-medium mb-6 max-w-xs mx-auto text-sm'>Upload your first PDF and start chatting with AI instantly.</p>
                <button className='bg-blue-600 text-white font-black px-6 py-3 rounded-xl border-2 border-black uppercase text-sm flex items-center gap-2 mx-auto hover:-translate-y-0.5 transition-transform'
                  style={{ boxShadow: SHADOW }}>
                  <Upload className='w-4 h-4' />
                  Upload First PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Side panels */}
        <div className='space-y-5'>

          {/* Recent activity */}
          <div className='bg-white border-2 border-black rounded-2xl overflow-hidden' style={{ boxShadow: SHADOW_LG }}>
            <div className='flex items-center gap-2 px-5 py-3 border-b-2 border-black bg-green-400'>
              <Clock className='w-4 h-4 text-black' />
              <h3 className='font-black text-black uppercase text-sm'>Recent Activity</h3>
            </div>
            <div className='p-4 space-y-3'>
              {fileList && fileList.length > 0 ? (
                fileList.slice(0, 4).map((file, i) => (
                  <Link key={i} href={'/workspace/' + file.fileId}>
                    <div className='flex items-center gap-3 p-3 rounded-xl border-2 border-black hover:-translate-y-0.5 transition-transform cursor-pointer bg-yellow-50'
                      style={{ boxShadow: '2px 2px 0 #000' }}>
                      <div className='w-8 h-8 bg-purple-500 border-2 border-black rounded-lg flex items-center justify-center flex-shrink-0'>
                        <FileText className='w-3.5 h-3.5 text-white' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs font-black text-black truncate'>{file.fileName}</p>
                        <p className='text-[10px] text-gray-500 font-medium'>{getTimeAgo(file._creationTime)}</p>
                      </div>
                      <span className='bg-green-400 text-black text-[9px] font-black px-2 py-0.5 rounded-full border border-black flex-shrink-0'>
                        Done
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className='text-center text-gray-500 text-sm font-medium py-4'>No activity yet</p>
              )}
            </div>
          </div>

          {/* Stats panel */}
          <div className='bg-white border-2 border-black rounded-2xl overflow-hidden' style={{ boxShadow: SHADOW_LG }}>
            <div className='flex items-center gap-2 px-5 py-3 border-b-2 border-black bg-purple-500'>
              <Zap className='w-4 h-4 text-white' />
              <h3 className='font-black text-white uppercase text-sm'>AI Stats</h3>
            </div>
            <div className='p-4 space-y-3'>
              {[
                { label: 'Tokens Processed', value: `${(fileList?.length || 0) * 156}`, bg: 'bg-purple-100', accent: 'text-purple-700', badge: 'Active' },
                { label: 'Docs Analyzed', value: `${fileList?.length || 0}`, bg: 'bg-blue-100', accent: 'text-blue-700', badge: 'Ready' },
                { label: 'Efficiency Gain', value: '89%', bg: 'bg-green-100', accent: 'text-green-700', badge: 'Optimized' },
              ].map(({ label, value, bg, accent, badge }) => (
                <div key={label} className={`${bg} border-2 border-black rounded-xl p-3`} style={{ boxShadow: '2px 2px 0 #000' }}>
                  <div className='flex items-center justify-between mb-1'>
                    <p className='text-xs font-black uppercase text-gray-600'>{label}</p>
                    <span className='bg-white text-black text-[9px] font-black px-2 py-0.5 rounded-full border border-black'>{badge}</span>
                  </div>
                  <p className={`text-2xl font-black ${accent}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
